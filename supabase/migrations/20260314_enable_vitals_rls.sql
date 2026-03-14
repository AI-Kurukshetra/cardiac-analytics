alter table public.vitals enable row level security;

create policy "authenticated users can insert their own vitals"
on public.vitals
for insert
to authenticated
with check (auth.uid() = patient_id);

create policy "users can view their own vitals"
on public.vitals
for select
to authenticated
using (auth.uid() = patient_id);
