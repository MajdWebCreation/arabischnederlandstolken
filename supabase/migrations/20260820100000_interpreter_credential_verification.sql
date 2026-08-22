-- Lets an interpreter self-edit their own sworn/Rbtv credentials (currently
-- fully admin-only - see enforce_interpreter_self_edit_columns() in
-- 20260817100000_interpreter_portal_access.sql) without that self-claim
-- silently becoming trusted data for matching. Preferred architecture from
-- the brief: interpreter edits -> "Te controleren" -> admin verifies ->
-- only the verified state feeds trusted (sworn-required) matching.
--
-- Four audit columns, mirroring the self-billing consent columns' shape
-- exactly (interpreters.self_billing_accepted_at/by):
alter table public.interpreters
  add column credentials_changed_at timestamptz,
  add column credentials_changed_by uuid references auth.users (id) on delete set null,
  add column credentials_verified_at timestamptz,
  add column credentials_verified_by uuid references auth.users (id) on delete set null,
  add constraint interpreters_credentials_changed_together check (
    (credentials_changed_at is null) = (credentials_changed_by is null)
  ),
  add constraint interpreters_credentials_verified_together check (
    (credentials_verified_at is null) = (credentials_verified_by is null)
  );

comment on column public.interpreters.credentials_changed_at is
  'Set whenever the interpreter self-edits sworn_interpreter/rbtv_number/rbtv_expiry_date (via interpreter_update_credentials()) or self-claims a sworn language combination - never touched by an ordinary admin edit. NULL means no self-claimed change is pending review.';
comment on column public.interpreters.credentials_verified_at is
  'Set when the currently-claimed credentials were last confirmed trustworthy - either explicitly by admin (approveInterpreterCredentials) or automatically whenever an admin directly edits sworn_interpreter/rbtv_number/rbtv_expiry_date themselves (see the trigger below). Cleared back to NULL by every new interpreter self-edit. Verification is stale (needs re-review) whenever credentials_changed_at is more recent than credentials_verified_at, or credentials_verified_at is NULL while credentials_changed_at is not.';

-- Extends the existing blocklist (CREATE OR REPLACE, same signature - see
-- 20260817100000_interpreter_portal_access.sql for the original, already
-- extended once by 20260818121200_interpreter_onboarding_fields.sql for
-- self-billing). Two behavioural additions, both narrowly scoped:
--
-- 1. A new transaction-local bypass flag (app.interpreter_credentials_rpc),
--    exactly mirroring app.interpreter_self_billing_rpc - the sole write
--    path for sworn_interpreter/rbtv_number/rbtv_expiry_date from a non-admin
--    session is interpreter_update_credentials() below, which sets this
--    flag immediately before its own UPDATE. Ordinary self-edit attempts
--    (a raw .update() on these columns) remain blocked exactly as before -
--    this bypass does not add a new grant, it only lets one specific,
--    fully-audited RPC through.
-- 2. When *admin* changes any of the three credential columns - whether via
--    the dedicated "Goedkeuren" action or by directly correcting the values
--    in the ordinary interpreter edit form - the currently-submitted values
--    are automatically considered verified: credentials_verified_at/by are
--    force-set to now()/auth.uid(), regardless of what (if anything) the
--    client sent for those two columns. This guarantees "an admin touched
--    these fields" and "these fields are marked verified" can never drift
--    apart, without relying on every admin code path remembering to set it.
create or replace function public.enforce_interpreter_self_edit_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(current_setting('app.interpreter_credentials_rpc', true), '') = 'true' then
    return new;
  end if;

  if public.is_admin() then
    if new.sworn_interpreter is distinct from old.sworn_interpreter
       or new.rbtv_number is distinct from old.rbtv_number
       or new.rbtv_expiry_date is distinct from old.rbtv_expiry_date
    then
      new.credentials_verified_at := now();
      new.credentials_verified_by := auth.uid();
    end if;

    return new;
  end if;

  if coalesce(current_setting('app.interpreter_self_billing_rpc', true), '') = 'true' then
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
     or new.self_billing_accepted_at is distinct from old.self_billing_accepted_at
     or new.self_billing_terms_version is distinct from old.self_billing_terms_version
     or new.self_billing_accepted_by is distinct from old.self_billing_accepted_by
     or new.credentials_changed_at is distinct from old.credentials_changed_at
     or new.credentials_changed_by is distinct from old.credentials_changed_by
     or new.credentials_verified_at is distinct from old.credentials_verified_at
     or new.credentials_verified_by is distinct from old.credentials_verified_by
  then
    raise exception 'field_not_self_editable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_interpreter_self_edit_columns() is
  'BEFORE UPDATE guard on interpreters. Admins may change anything (and touching sworn/rbtv fields auto-stamps credentials_verified_at/by). A non-admin may change phone/city plus every business/payment/fiscal onboarding column, but never identity/qualification fields directly - sworn_interpreter/rbtv_number/rbtv_expiry_date and the credentials_* tracking columns are only ever set via interpreter_update_credentials() (bypass flag app.interpreter_credentials_rpc), exactly like self_billing_* is only set via interpreter_accept_self_billing_agreement().';

-- Sole write path for interpreter self-edit of sworn/Rbtv credentials.
-- Mirrors interpreter_accept_self_billing_agreement()'s shape exactly:
-- gated by current_interpreter_id(), never trusts a caller-supplied user id,
-- and stamps changed_by as auth.uid() itself. Deliberately does NOT block
-- the interpreter from saving whatever they claim (brief section 9) - it
-- always succeeds for the caller's own row - but every call unconditionally
-- clears credentials_verified_at/by, so a self-claim can never silently
-- carry forward a previous verification.
-- p_rbtv_number/p_rbtv_expiry_date are plain text (not date) so the caller
-- can always pass a definite string (possibly empty), never null/undefined -
-- Supabase's generated TypeScript Args type for an RPC parameter is never
-- nullable regardless of the underlying SQL type, so a text-or-null
-- Postgres parameter would force an unsound cast at every call site. Blank
-- is normalised to NULL, and the date is validated/cast, inside the
-- function instead.
create or replace function public.interpreter_update_credentials(
  p_sworn_interpreter boolean,
  p_rbtv_number text,
  p_rbtv_expiry_date text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
  v_rbtv_number text := nullif(btrim(coalesce(p_rbtv_number, '')), '');
  v_rbtv_expiry_date date := nullif(btrim(coalesce(p_rbtv_expiry_date, '')), '')::date;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  perform set_config('app.interpreter_credentials_rpc', 'true', true);

  update public.interpreters
  set
    sworn_interpreter = coalesce(p_sworn_interpreter, false),
    rbtv_number = v_rbtv_number,
    rbtv_expiry_date = v_rbtv_expiry_date,
    credentials_changed_at = now(),
    credentials_changed_by = auth.uid(),
    credentials_verified_at = null,
    credentials_verified_by = null
  where id = v_interpreter_id;
end;
$$;

comment on function public.interpreter_update_credentials(boolean, text, text) is
  'Interpreter-only. Sole write path for self-editing sworn_interpreter/rbtv_number/rbtv_expiry_date. Always succeeds for the caller''s own row (never blocks saving a claim) and unconditionally resets credentials_verified_at/by to NULL, stamping credentials_changed_at/by(=auth.uid()) - the claim becomes "Te controleren" until an admin reviews it.';

revoke all on function public.interpreter_update_credentials(boolean, text, text) from public;
grant execute on function public.interpreter_update_credentials(boolean, text, text) to authenticated;

-- Interpreters may now fully manage their own language combinations
-- (previously read-only - see 20260817100000_interpreter_portal_access.sql,
-- "Interpreters can read their own languages"). Ordinary RLS is sufficient
-- here (no RPC/bypass-flag needed): adding/editing/removing a whole row of
-- one's own is not "silently overwriting an existing trusted value" the way
-- changing a scalar credential column is - the trigger below is what keeps
-- a *sworn* claim specifically from becoming trusted without review.
create policy "Interpreters can add their own languages"
  on public.interpreter_languages
  for insert
  to authenticated
  with check (interpreter_id = public.current_interpreter_id());

create policy "Interpreters can update their own languages"
  on public.interpreter_languages
  for update
  to authenticated
  using (interpreter_id = public.current_interpreter_id())
  with check (interpreter_id = public.current_interpreter_id());

create policy "Interpreters can remove their own languages"
  on public.interpreter_languages
  for delete
  to authenticated
  using (interpreter_id = public.current_interpreter_id());

-- Only a language combination newly becoming sworn=true is a trust claim
-- worth flagging - turning it off, editing notes, or an admin's own change
-- (is_admin() bypasses entirely, matching every other admin write in this
-- project) need no review. Fires cross-table (interpreter_languages ->
-- interpreters), so it must itself set the same bypass flag
-- interpreter_update_credentials() uses before its UPDATE reaches the
-- interpreters table's own BEFORE UPDATE trigger.
create or replace function public.flag_interpreter_credentials_on_sworn_language()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.sworn_for_combination is true
     and (tg_op = 'INSERT' or old.sworn_for_combination is distinct from true)
  then
    perform set_config('app.interpreter_credentials_rpc', 'true', true);

    update public.interpreters
    set
      credentials_changed_at = now(),
      credentials_changed_by = auth.uid(),
      credentials_verified_at = null,
      credentials_verified_by = null
    where id = new.interpreter_id;
  end if;

  return new;
end;
$$;

comment on function public.flag_interpreter_credentials_on_sworn_language() is
  'AFTER INSERT/UPDATE on interpreter_languages: a non-admin self-claiming sworn_for_combination=true on a language pair marks the parent interpreter''s credentials as pending review, exactly like editing sworn_interpreter/rbtv_number/rbtv_expiry_date directly does.';

create trigger flag_interpreter_credentials_on_sworn_language_trigger
  after insert or update on public.interpreter_languages
  for each row
  execute function public.flag_interpreter_credentials_on_sworn_language();

-- Dialects/specialisations stay outside the verification model entirely -
-- see the brief's explicit "especially: sworn status, Rbtv number, Rbtv
-- expiry, sworn language combination" list, which does not include these.
-- Supersedes the narrower reasoning in 20260817100100_capability_tags.sql
-- ("an interpreter can read their own rows... but never write here") - this
-- is now a deliberate product decision to let interpreters manage their own
-- taxonomy tags freely, same as language combinations.
create policy "Interpreters can add their own capabilities"
  on public.interpreter_capabilities
  for insert
  to authenticated
  with check (interpreter_id = public.current_interpreter_id());

create policy "Interpreters can remove their own capabilities"
  on public.interpreter_capabilities
  for delete
  to authenticated
  using (interpreter_id = public.current_interpreter_id());

-- Admin-only, plain update (no RPC needed - admin already holds a full
-- grant and enforce_interpreter_self_edit_columns()'s is_admin() branch
-- lets any field through). Used by the "Goedkeuren" action on
-- /admin/interpreters/[id] to approve the *currently* claimed values
-- as-is, without editing them.
create or replace function public.approve_interpreter_credentials(p_interpreter_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  update public.interpreters
  set credentials_verified_at = now(), credentials_verified_by = auth.uid()
  where id = p_interpreter_id;
end;
$$;

comment on function public.approve_interpreter_credentials(uuid) is
  'Admin-only. Marks an interpreter''s currently-claimed sworn/Rbtv credentials as verified as-is, without changing them - the "Goedkeuren" action on /admin/interpreters/[id].';

revoke all on function public.approve_interpreter_credentials(uuid) from public;
grant execute on function public.approve_interpreter_credentials(uuid) to authenticated;
