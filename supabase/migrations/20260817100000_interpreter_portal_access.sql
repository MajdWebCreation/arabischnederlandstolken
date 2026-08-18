-- Phase 2 foundation: interpreter portal access.
--
-- current_interpreter_id() centralises the exact three-part access rule the
-- interpreter portal requires everywhere it needs to know "is the caller a
-- usable interpreter, and if so which one": an authenticated Supabase user,
-- whose profile has role = 'interpreter', linked to an ACTIVE interpreter
-- record. Returns NULL the moment any part of that stops being true - in
-- particular, deactivating an interpreter (interpreters.active = false)
-- immediately revokes their portal access everywhere this function is used,
-- with no separate "disable portal access" step required.
--
-- SECURITY DEFINER for the same reason as is_admin(): safe to call from RLS
-- policies and view definitions regardless of the calling role's own grants,
-- with search_path pinned against hijacking.
create or replace function public.current_interpreter_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select i.id
  from public.interpreters i
  join public.profiles p on p.id = auth.uid()
  where i.user_id = auth.uid()
    and i.active = true
    and p.role = 'interpreter'
  limit 1;
$$;

comment on function public.current_interpreter_id() is
  'Returns the interpreters.id linked to the current session, or NULL unless the user is authenticated, profiles.role = ''interpreter'', and the linked interpreter record is active. The single access gate for the entire interpreter portal.';

revoke all on function public.current_interpreter_id() from public;
grant execute on function public.current_interpreter_id() to authenticated;

-- Interpreters can read their own directory record (name, contact, sworn
-- status, Rbtv info) for their profile page. This is strictly additive to
-- the existing admin policy from Phase 1 - Postgres RLS policies for the
-- same command are OR'd together, so admins keep full access and an
-- interpreter additionally sees exactly their own row.
create policy "Interpreters can read their own record"
  on public.interpreters
  for select
  to authenticated
  using (id = public.current_interpreter_id());

-- Interpreters may self-edit only phone and city (section 18). Qualifications
-- - sworn status, Rbtv number/expiry, active status, languages, and
-- capabilities - stay admin-controlled.
--
-- A column-level GRANT alone cannot enforce this: Phase 1 already granted a
-- blanket `update` on interpreters to `authenticated` (relying on RLS to
-- restrict it to admins), and GRANT is purely additive - a later, narrower
-- column grant does not revoke or shadow that earlier broad one. Row Level
-- Security is row-scoped, not column-scoped, so the RLS policy below (which
-- only needs to confirm "is this my own row") cannot restrict which
-- columns change either. The trigger is what actually enforces the column
-- allowlist: it inspects every non-admin UPDATE and rejects it outright if
-- anything other than phone/city changed, regardless of what a client
-- attempts to send.
create policy "Interpreters can update their own contact details"
  on public.interpreters
  for update
  to authenticated
  using (id = public.current_interpreter_id())
  with check (id = public.current_interpreter_id());

create or replace function public.enforce_interpreter_self_edit_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.first_name is distinct from old.first_name
     or new.last_name is distinct from old.last_name
     or new.email is distinct from old.email
     or new.active is distinct from old.active
     or new.sworn_interpreter is distinct from old.sworn_interpreter
     or new.rbtv_number is distinct from old.rbtv_number
     or new.rbtv_expiry_date is distinct from old.rbtv_expiry_date
     or new.internal_notes is distinct from old.internal_notes
     or new.user_id is distinct from old.user_id
  then
    raise exception 'only_phone_and_city_are_self_editable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_interpreter_self_edit_columns() is
  'BEFORE UPDATE guard on interpreters: admins may change anything, but a non-admin (necessarily updating their own row, per the RLS policy above) may only change phone/city. This is the actual enforcement of "an interpreter cannot self-declare sworn status or edit Rbtv/language/capability data" - see the comment above for why a column-level GRANT alone does not achieve this.';

create trigger enforce_interpreter_self_edit_columns_trigger
  before update on public.interpreters
  for each row
  execute function public.enforce_interpreter_self_edit_columns();

-- Interpreters can read their own registered language combinations.
create policy "Interpreters can read their own languages"
  on public.interpreter_languages
  for select
  to authenticated
  using (interpreter_id = public.current_interpreter_id());
