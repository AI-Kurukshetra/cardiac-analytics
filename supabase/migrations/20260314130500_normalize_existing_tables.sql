do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'vitals'
  ) then
    alter table public.vitals
      add column if not exists created_at timestamptz not null default timezone('utc', now());

    create index if not exists vitals_patient_id_created_at_idx
      on public.vitals (patient_id, created_at desc);
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'medications'
  ) then
    alter table public.medications
      add column if not exists created_at timestamptz not null default timezone('utc', now()),
      add column if not exists dosage text,
      add column if not exists frequency text,
      add column if not exists notes text,
      add column if not exists medication_name text;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'medications'
        and column_name = 'name'
    ) then
      execute '
        update public.medications
        set medication_name = coalesce(medication_name, name)
        where medication_name is null
      ';
    end if;

    create index if not exists medications_patient_id_created_at_idx
      on public.medications (patient_id, created_at desc);
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'medications'
  ) then
    alter table public.medications enable row level security;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'medications'
        and policyname = 'users can view their own medications'
    ) then
      create policy "users can view their own medications"
      on public.medications
      for select
      to authenticated
      using (auth.uid() = patient_id);
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'medications'
        and policyname = 'authenticated users can insert their own medications'
    ) then
      create policy "authenticated users can insert their own medications"
      on public.medications
      for insert
      to authenticated
      with check (auth.uid() = patient_id);
    end if;
  end if;
end
$$;
