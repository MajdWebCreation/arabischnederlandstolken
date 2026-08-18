-- Links an interpreter directory record to an existing Supabase Auth user
-- by email, and grants the 'interpreter' role. There is still no service
-- role key anywhere in this application and no public self-registration:
-- the Auth user itself must already exist, created once through the
-- Supabase dashboard (Authentication -> Users -> Add/invite user) - exactly
-- the same one manual step Phase 1 already required to create the first
-- admin account. This function only does the linking, which is the part
-- that's safe to automate.
--
-- profiles has no direct UPDATE grant for anyone via the API (see Phase 1's
-- profiles migration) - role changes only ever happen through SECURITY
-- DEFINER functions like this one, and this one can only ever set role to
-- 'interpreter', never 'admin', and refuses to touch an account that is
-- already an admin. That keeps the "no privilege escalation to admin
-- through the app" guarantee from Phase 1 completely intact.
create or replace function public.admin_link_interpreter_account(
  p_interpreter_id uuid,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_target_user_id uuid;
  v_existing_role text;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select id into v_target_user_id
  from auth.users
  where lower(email) = lower(btrim(p_email))
  limit 1;

  if v_target_user_id is null then
    raise exception 'auth_user_not_found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.interpreters
    where user_id = v_target_user_id and id <> p_interpreter_id
  ) then
    raise exception 'already_linked_elsewhere' using errcode = '55000';
  end if;

  select role into v_existing_role from public.profiles where id = v_target_user_id;

  if v_existing_role = 'admin' then
    raise exception 'target_is_admin' using errcode = '55000';
  end if;

  update public.profiles set role = 'interpreter' where id = v_target_user_id;
  update public.interpreters set user_id = v_target_user_id where id = p_interpreter_id;

  return v_target_user_id;
end;
$$;

comment on function public.admin_link_interpreter_account(uuid, text) is
  'Admin-only. Links an interpreter record to an existing auth.users account by email and grants role=''interpreter''. Never creates an auth account, never grants ''admin'', and refuses to touch an account that already is one.';

-- Reverses the above: clears the link and, if the account's role is still
-- exactly 'interpreter' (never touching an admin), reverts it to no access.
create or replace function public.admin_unlink_interpreter_account(p_interpreter_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select user_id into v_user_id from public.interpreters where id = p_interpreter_id;

  if v_user_id is null then
    return;
  end if;

  update public.interpreters set user_id = null where id = p_interpreter_id;

  update public.profiles
  set role = null
  where id = v_user_id and role = 'interpreter';
end;
$$;

comment on function public.admin_unlink_interpreter_account(uuid) is
  'Admin-only. Clears the interpreter''s linked auth account and revokes their interpreter role (unless it has since become ''admin'', which this never touches).';

revoke all on function public.admin_link_interpreter_account(uuid, text) from public;
revoke all on function public.admin_unlink_interpreter_account(uuid) from public;
grant execute on function public.admin_link_interpreter_account(uuid, text) to authenticated;
grant execute on function public.admin_unlink_interpreter_account(uuid) to authenticated;
