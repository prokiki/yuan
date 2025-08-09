-- Supabase schema for v3 cloud sync
create table if not exists public.families_state (
  family_id text primary key,
  state_json jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.families_state enable row level security;
create policy "rw for auth" on public.families_state
  for select using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
