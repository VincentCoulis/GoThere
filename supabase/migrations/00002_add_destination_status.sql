-- Add status column for quarantine workflow
alter table public.destinations
  add column status text not null default 'active'
  check (status in ('active', 'pending_review', 'rejected'));

-- Add flag_reason to store why a URL was flagged
alter table public.destinations
  add column flag_reason text;

-- Update the public read policy to also require status = 'active'
drop policy "Public read" on public.destinations;
create policy "Public read" on public.destinations
  for select using (is_active = true and status = 'active');

-- Owners can read all their own destinations (any status)
create policy "Owner read own" on public.destinations
  for select to authenticated
  using (auth.uid() = created_by);
