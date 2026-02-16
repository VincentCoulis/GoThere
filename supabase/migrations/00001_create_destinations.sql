-- Destinations table: maps phrases to URLs
create table public.destinations (
  id uuid default gen_random_uuid() primary key,
  phrase text not null unique,
  url text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  click_count bigint default 0 not null,
  is_active boolean default true not null
);

-- Index for fast phrase lookups (the core query)
create index idx_destinations_phrase on public.destinations (lower(phrase));

-- Row-level security
alter table public.destinations enable row level security;

-- Anyone can read active destinations
create policy "Public read" on public.destinations
  for select using (is_active = true);

-- Authenticated users can insert
create policy "Auth insert" on public.destinations
  for insert to authenticated
  with check (auth.uid() = created_by);

-- Owners can update their own destinations
create policy "Owner update" on public.destinations
  for update to authenticated
  using (auth.uid() = created_by);
