alter table public.vitals enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'vitals'
      and policyname = 'authenticated users can insert their own vitals'
  ) then
    create policy "authenticated users can insert their own vitals"
    on public.vitals
    for insert
    to authenticated
    with check (auth.uid() = patient_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'vitals'
      and policyname = 'users can view their own vitals'
  ) then
    create policy "users can view their own vitals"
    on public.vitals
    for select
    to authenticated
    using (auth.uid() = patient_id);
  end if;
end
$$;
