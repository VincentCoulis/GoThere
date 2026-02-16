-- Config table for app settings (replaces GUC variables which Supabase doesn't allow)
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- Disable RLS on config table (it's read-only app config)
alter table public.app_config enable row level security;
create policy "Anyone can read config" on public.app_config
  for select using (true);

-- Set admin email
insert into public.app_config (key, value)
  values ('admin_email', 'chriscoleybusiness@gmail.com')
  on conflict (key) do update set value = excluded.value;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.app_config
    where key = 'admin_email'
      and value = (auth.jwt() ->> 'email')
  );
$$;

-- Fix 1: Add missing DELETE policy for owners
create policy "Owner delete" on public.destinations
  for delete to authenticated
  using (auth.uid() = created_by);

-- Fix 2: Admin can read ALL destinations (needed for review queue)
create policy "Admin read all" on public.destinations
  for select to authenticated
  using (public.is_admin());

-- Fix 3: Admin can update ANY destination (needed for approve/reject)
create policy "Admin update all" on public.destinations
  for update to authenticated
  using (public.is_admin());
