do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.profiles enable row level security;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'profiles'
        and policyname = 'users can view their own profile'
    ) then
      create policy "users can view their own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'profiles'
        and policyname = 'providers can view patient profiles'
    ) then
      create policy "providers can view patient profiles"
      on public.profiles
      for select
      to authenticated
      using (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'provider'
        and role = 'patient'
      );
    end if;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'vitals'
  ) then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'vitals'
        and policyname = 'providers can view patient vitals'
    ) then
      create policy "providers can view patient vitals"
      on public.vitals
      for select
      to authenticated
      using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'provider');
    end if;
  end if;
end
$$;
