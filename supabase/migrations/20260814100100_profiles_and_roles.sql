-- Admin authentication and role-based authorization.
--
-- Every Supabase Auth user automatically gets a profiles row (role = NULL,
-- meaning no access) via the trigger below. Granting the "admin" role is a
-- deliberate, manual action taken directly in the SQL editor by whoever
-- controls the database - there is no application code path, API route, or
-- RLS policy that lets any user create or promote an admin. That is what
-- keeps this scheme safe from privilege escalation.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text check (role in ('admin', 'interpreter')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per Supabase Auth user. role is NULL (no dashboard access) until an admin manually promotes the account via SQL.';
comment on column public.profiles.role is
  'NULL = no access. ''admin'' = full admin dashboard access today. ''interpreter'' is reserved for the Phase 2 interpreter portal and is not used by any Phase 1 code path.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Creates a profile row (role = NULL) whenever a new Auth user is created,
-- so every user has exactly one profiles row and the app never has to
-- special-case a "missing profile" state.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- SECURITY DEFINER so this can be evaluated from RLS policies on other
-- tables regardless of the calling role's own grants on profiles, and to
-- sidestep recursive-policy issues. search_path is pinned to prevent
-- search_path hijacking, which is the classic SECURITY DEFINER pitfall.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True if the currently authenticated user has an admin profile. Used throughout Row Level Security policies to gate admin-only tables.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- Deliberately no insert/update/delete grants for authenticated: profile
-- rows are only ever created by the trigger above, and role is only ever
-- changed by manual SQL. No user - including an admin - can change their
-- own or anyone else's role through the API.
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());
