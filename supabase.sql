-- Run in Supabase SQL editor. All authenticated company users are admins.
-- IMPORTANT: public signups must also be restricted by the BEFORE USER CREATED hook
-- or Supabase Auth settings. Frontend checks alone do not enforce the domain.
create table if not exists public.workspace (
  id integer primary key check (id = 1),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.workspace enable row level security;
create or replace function public.is_company_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and lower(split_part(u.email,'@',2))='dielichtgestalter.de');
$$;
drop policy if exists "company admins read" on public.workspace;
create policy "company admins read" on public.workspace for select to authenticated using (public.is_company_admin());
drop policy if exists "company admins write" on public.workspace;
create policy "company admins write" on public.workspace for all to authenticated using (public.is_company_admin()) with check (public.is_company_admin());
-- Secure registration: Supabase Auth -> Hooks -> Before User Created ->
-- implement domain allowlist server-side (or disable public signups and invite employees).
-- Future production schema should normalize customers/projects/docs and use a
-- transactional database sequence; this JSON workspace is a collaborative MVP only.
