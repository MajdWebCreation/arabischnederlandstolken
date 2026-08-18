-- Phase 4 foundation: customer portal access.
--
-- Mirrors the Phase 2 interpreter-portal access model exactly (see
-- 20260817100000_interpreter_portal_access.sql and
-- 20260817100700_interpreter_account_linking.sql), with one deliberate
-- structural difference: interpreters has a single user_id column because
-- one interpreter is one person, but a customer is often an organisation
-- (e.g. Praktijk Escalona B.V.) that may eventually need more than one
-- authorised employee. customer_portal_memberships is a join table for
-- exactly that reason - customer_id/user_id/role/active - so supporting a
-- second authorised person later needs a second row, never a redesign of
-- the customers table itself.
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'interpreter', 'customer'));

create table public.customer_portal_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- A snapshot of the email admin linked this account by, not a live read
  -- of auth.users.email - PostgREST does not expose the auth schema, and
  -- this project has no service-role key to read it any other way (see
  -- admin_link_customer_account below). Good enough for the admin UI's
  -- "which account is this" display without introducing one.
  email text,
  -- 'customer_admin' is the only role today (can manage bookings for the
  -- organisation). Kept as free text rather than an enum so a future,
  -- narrower role (e.g. read-only) is a data change, not a migration.
  role text not null default 'customer_admin' check (btrim(role) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, user_id)
);

comment on table public.customer_portal_memberships is
  'Links a Supabase Auth user to a customer organisation for portal access, with room for more than one authorised person per organisation. Deactivate (active=false) rather than delete to preserve the historical link.';

create trigger set_customer_portal_memberships_updated_at
  before update on public.customer_portal_memberships
  for each row
  execute function public.set_updated_at();

create index customer_portal_memberships_customer_id_idx on public.customer_portal_memberships (customer_id);
create index customer_portal_memberships_user_id_idx on public.customer_portal_memberships (user_id) where active;

alter table public.customer_portal_memberships enable row level security;

revoke all on public.customer_portal_memberships from anon, authenticated;
-- No direct insert/update grant for authenticated at all: every membership
-- change goes through admin_link_customer_account /
-- admin_unlink_customer_account below, the same allowlist-RPC pattern used
-- for interpreter account linking.
grant select on public.customer_portal_memberships to authenticated;

create policy "Admins manage customer portal memberships"
  on public.customer_portal_memberships
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Members can read their own membership rows"
  on public.customer_portal_memberships
  for select
  to authenticated
  using (user_id = auth.uid());

-- Centralises "is the caller a usable customer-portal user, and for which
-- organisation(s)" exactly like current_interpreter_id() does for the
-- interpreter portal. Returns a set (not a single uuid) because the
-- membership model deliberately allows one person to be linked to more
-- than one customer in the future - every RLS policy and RPC below treats
-- "my customer ids" as a set from day one, so supporting that later never
-- requires touching this function's callers.
create or replace function public.current_customer_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cpm.customer_id
  from public.customer_portal_memberships cpm
  join public.profiles p on p.id = auth.uid()
  where cpm.user_id = auth.uid()
    and cpm.active = true
    and p.role = 'customer';
$$;

comment on function public.current_customer_ids() is
  'Returns the customers.id set the current session may act on behalf of: every organisation with an active customer_portal_memberships row for this auth.uid(), but only while profiles.role = ''customer''. Empty for anyone else. The single access gate for the entire customer portal.';

revoke all on function public.current_customer_ids() from public;
grant execute on function public.current_customer_ids() to authenticated;

-- Customers can read their own organisation's profile row. Strictly
-- additive to the existing admin policy from Phase 1 (Postgres OR's
-- policies for the same command together), so admins keep full access.
create policy "Customers can read their own organisation"
  on public.customers
  for select
  to authenticated
  using (id in (select public.current_customer_ids()));

-- Customers may self-edit only the safe profile fields listed in the
-- Phase 4 brief (contact name, phone, billing email/address). Everything
-- else - type, email, organisation, KVK/VAT, internal_notes, the
-- admin-managed booking defaults, and the reserved auto-confirm flag -
-- stays admin-controlled. As with interpreters' identical pattern (see
-- 20260817100000_interpreter_portal_access.sql), RLS alone cannot express
-- a column-level restriction, so the trigger below is the actual
-- enforcement; the policy only confirms row ownership.
create policy "Customers can update their own safe profile fields"
  on public.customers
  for update
  to authenticated
  using (id in (select public.current_customer_ids()))
  with check (id in (select public.current_customer_ids()));

create or replace function public.enforce_customer_self_edit_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.type is distinct from old.type
     or new.email is distinct from old.email
     or new.organisation is distinct from old.organisation
     or new.kvk_number is distinct from old.kvk_number
     or new.vat_number is distinct from old.vat_number
     or new.internal_notes is distinct from old.internal_notes
     or new.billing_address is distinct from old.billing_address
     or new.default_language_from is distinct from old.default_language_from
     or new.default_language_to is distinct from old.default_language_to
     or new.default_language_notes is distinct from old.default_language_notes
     or new.default_context is distinct from old.default_context
     or new.default_modality is distinct from old.default_modality
     or new.default_sworn_required is distinct from old.default_sworn_required
     or new.default_duration_minutes is distinct from old.default_duration_minutes
     or new.default_location_name is distinct from old.default_location_name
     or new.default_location_address is distinct from old.default_location_address
     or new.auto_confirm_when_interpreter_selected is distinct from old.auto_confirm_when_interpreter_selected
  then
    raise exception 'only_safe_profile_fields_are_self_editable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_customer_self_edit_columns() is
  'BEFORE UPDATE guard on customers: admins may change anything, but a non-admin (necessarily updating their own organisation, per the RLS policy above) may only change name/phone/billing_name/billing_email/billing_street/billing_house_number(_addition)/billing_postal_code/billing_city.';

create trigger enforce_customer_self_edit_columns_trigger
  before update on public.customers
  for each row
  execute function public.enforce_customer_self_edit_columns();

-- Links an existing Supabase Auth user to a customer by email, exactly
-- mirroring admin_link_interpreter_account: the Auth user must already
-- exist (created once via the Supabase dashboard - see the Phase 4 report
-- for the manual step), this function only does the linking, it can only
-- ever grant role='customer' (never 'admin'), and it refuses to touch an
-- account that is already an admin or interpreter. on conflict reactivates
-- a previously unlinked membership instead of erroring, so re-linking the
-- same person after an accidental unlink is a normal, safe action.
create or replace function public.admin_link_customer_account(
  p_customer_id uuid,
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

  select role into v_existing_role from public.profiles where id = v_target_user_id;

  if v_existing_role = 'admin' then
    raise exception 'target_is_admin' using errcode = '55000';
  end if;

  if v_existing_role = 'interpreter' then
    raise exception 'target_is_interpreter' using errcode = '55000';
  end if;

  update public.profiles set role = 'customer' where id = v_target_user_id;

  insert into public.customer_portal_memberships (customer_id, user_id, email, role, active)
  values (p_customer_id, v_target_user_id, lower(btrim(p_email)), 'customer_admin', true)
  on conflict (customer_id, user_id)
  do update set active = true, role = 'customer_admin', email = excluded.email;

  return v_target_user_id;
end;
$$;

comment on function public.admin_link_customer_account(uuid, text) is
  'Admin-only. Links a customer to an existing auth.users account by email and grants role=''customer''. Never creates an auth account, never grants ''admin''/''interpreter'', and refuses to touch an account that already has either. Re-linking a previously unlinked membership reactivates it.';

-- Deactivates one specific membership row (a customer may eventually have
-- more than one), and only reverts the user's role to no-access if they
-- have no other active membership left - unlike interpreters (one user_id
-- column, one unlink = fully unlinked), unlinking person A from org X must
-- not affect person A's still-active membership at org Y.
create or replace function public.admin_unlink_customer_account(p_membership_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_remaining_active integer;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select user_id into v_user_id
  from public.customer_portal_memberships
  where id = p_membership_id;

  if v_user_id is null then
    return;
  end if;

  update public.customer_portal_memberships set active = false where id = p_membership_id;

  select count(*) into v_remaining_active
  from public.customer_portal_memberships
  where user_id = v_user_id and active = true;

  if v_remaining_active = 0 then
    update public.profiles set role = null where id = v_user_id and role = 'customer';
  end if;
end;
$$;

comment on function public.admin_unlink_customer_account(uuid) is
  'Admin-only. Deactivates one membership row. Only reverts the linked user''s role to no-access once they have zero remaining active memberships anywhere (and only if that role is still exactly ''customer'').';

revoke all on function public.admin_link_customer_account(uuid, text) from public;
revoke all on function public.admin_unlink_customer_account(uuid) from public;
grant execute on function public.admin_link_customer_account(uuid, text) to authenticated;
grant execute on function public.admin_unlink_customer_account(uuid) to authenticated;
