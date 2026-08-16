-- Interpreters: internal directory of interpreters the agency can assign.
--
-- No login is required in Phase 1. `user_id` is included now (nullable,
-- unused) so Phase 2 can wire up interpreter accounts without an later
-- schema change to this table.

create table public.interpreters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  first_name text not null check (btrim(first_name) <> ''),
  last_name text not null check (btrim(last_name) <> ''),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  city text,
  active boolean not null default true,
  sworn_interpreter boolean not null default false,
  rbtv_number text,
  rbtv_expiry_date date,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.interpreters is
  'Internal directory of interpreters the agency can assign to bookings. Deactivate (active = false) instead of deleting once an interpreter has booking history.';
comment on column public.interpreters.user_id is
  'Reserved for the Phase 2 interpreter portal login. Always NULL in Phase 1.';
comment on column public.interpreters.rbtv_number is
  'Manually maintained by admin in Phase 1. Presence of a number is not independent verification of Rbtv registration.';

create trigger set_interpreters_updated_at
  before update on public.interpreters
  for each row
  execute function public.set_updated_at();

create index interpreters_active_idx on public.interpreters (active);
create index interpreters_rbtv_number_idx on public.interpreters (rbtv_number) where rbtv_number is not null;
create index interpreters_email_idx on public.interpreters (lower(email));

alter table public.interpreters enable row level security;

revoke all on public.interpreters from anon, authenticated;
-- No delete grant: interpreters with booking history must never be
-- permanently removed. The admin UI only ever offers deactivation.
grant select, insert, update on public.interpreters to authenticated;

create policy "Admins manage interpreters"
  on public.interpreters
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Language combinations an interpreter can work in. Free-text language
-- values (not an enum) so the directory is not hard-limited to Arabic and
-- Dutch, matching the requirement that this generalise to other languages
-- later without a schema change. The application layer uses short lowercase
-- codes ('ar', 'nl', ...) by convention, which keeps future language-based
-- matching a simple equality check, but the column itself stays unconstrained.
create table public.interpreter_languages (
  id uuid primary key default gen_random_uuid(),
  interpreter_id uuid not null references public.interpreters (id) on delete cascade,
  language_from text not null check (btrim(language_from) <> ''),
  language_to text not null check (btrim(language_to) <> ''),
  sworn_for_combination boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (interpreter_id, language_from, language_to)
);

comment on table public.interpreter_languages is
  'Language combinations an interpreter can work in, with sworn status per combination.';

create index interpreter_languages_interpreter_id_idx on public.interpreter_languages (interpreter_id);

alter table public.interpreter_languages enable row level security;

revoke all on public.interpreter_languages from anon, authenticated;
grant select, insert, update, delete on public.interpreter_languages to authenticated;

create policy "Admins manage interpreter languages"
  on public.interpreter_languages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
