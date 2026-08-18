-- Interpreter account-completion onboarding: business details, payment
-- details, fiscal/VAT treatment, and self-billing consent. Foundation only
-- - no invoice numbering, settlement calculation, or payout mechanics yet
-- (a later phase), so nothing here does more than store what the
-- interpreter provides and let the portal/admin see whether it's complete.
alter table public.interpreters
  -- C. Business details - same structured-address shape as
  -- customers.billing_street/etc (20260818110000_customer_structured_billing_address.sql),
  -- for the same reason: a single free-text field can't be reliably split
  -- later, so it's structured from the start. trade_name/kvk_number/vat_id
  -- are genuinely optional (not every interpreter operates under a trade
  -- name or is KVK/VAT registered), so they are never required for
  -- completeness - see lib/interpreters/completeness.ts.
  add column legal_business_name text,
  add column trade_name text,
  add column business_street text,
  add column business_house_number text,
  add column business_house_number_addition text,
  add column business_postal_code text,
  add column business_city text,
  add column kvk_number text,
  add column vat_id text,

  -- D. Payment details.
  add column iban text check (iban is null or iban ~* '^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$'),
  add column account_holder_name text,

  -- E. Fiscal/invoicing setup. Deliberately never inferred or defaulted -
  -- NULL until the interpreter explicitly chooses one, exactly like
  -- customers.type has no "correct" default either. Four distinct values
  -- rather than folding "no VAT" and "other" together, so a genuine "not
  -- VAT liable" declaration is never confused with a genuinely
  -- unclassified/manual-follow-up case.
  add column vat_treatment text check (vat_treatment is null or vat_treatment in ('standard_vat', 'kor', 'no_vat', 'other')),

  -- F. Self-billing agreement. Write-once-per-acceptance via
  -- interpreter_accept_self_billing_agreement() below, never through the
  -- general self-edit path - see enforce_interpreter_self_edit_columns()
  -- further down, which explicitly blocks direct writes to these three.
  add column self_billing_accepted_at timestamptz,
  add column self_billing_terms_version text,
  add column self_billing_accepted_by uuid references auth.users (id) on delete set null,
  add constraint interpreters_self_billing_together check (
    (self_billing_accepted_at is null) = (self_billing_terms_version is null)
    and (self_billing_accepted_at is null) = (self_billing_accepted_by is null)
  );

comment on column public.interpreters.iban is 'Admin-only in list views and never exposed to customers - see lib/interpreters/completeness.ts and the admin readiness section, which only ever renders a boolean, never this value.';
comment on column public.interpreters.vat_treatment is 'Self-declared by the interpreter, never inferred. NULL means not yet declared - see completeness checks.';
comment on column public.interpreters.self_billing_accepted_at is 'Set only by interpreter_accept_self_billing_agreement() - never by a direct UPDATE, even from the interpreter''s own session. NULL means self-billing has not been consented to yet.';

-- Existing interpreters (already in the database before this migration)
-- simply have every one of these columns NULL, which is exactly the
-- "incomplete onboarding" state the portal is designed to show - no
-- backfill, no fabricated KVK/VAT/IBAN values.

-- Extends the existing blocklist (CREATE OR REPLACE, same signature - see
-- 20260817100000_interpreter_portal_access.sql for the original) rather
-- than an allowlist rewrite: every new business/payment/fiscal column
-- added above is self-editable by default under that design (the
-- interpreter's own business/bank/tax details are exactly the kind of
-- thing only they would know, unlike sworn status or Rbtv data), and only
-- the three self-billing columns need to be explicitly added here so the
-- dedicated RPC stays the sole write path for them.
-- SECURITY DEFINER changes which role's table grants/RLS apply, but it
-- does NOT bypass BEFORE UPDATE triggers, and auth.uid()/is_admin() still
-- resolve to the real caller (Sara, say) inside a SECURITY DEFINER
-- function's own UPDATE - so without this, even
-- interpreter_accept_self_billing_agreement() below would trip this exact
-- trigger's own blocklist on the columns it exists to protect. The
-- standard fix: a transaction-local flag (set_config(..., true) - "true"
-- means local to the current transaction, so it can never leak into
-- another request) that only that one narrowly-scoped RPC ever sets, and
-- only immediately before the one UPDATE it ever performs (exactly those
-- three columns, nothing else). Not reachable by a client directly:
-- set_config() is a Postgres builtin, never exposed as a callable
-- PostgREST RPC endpoint, so nothing except this specific function body
-- can ever set the flag.
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
  then
    raise exception 'field_not_self_editable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_interpreter_self_edit_columns() is
  'BEFORE UPDATE guard on interpreters: admins may change anything. A non-admin (necessarily updating their own row, per the RLS policy in 20260817100000_interpreter_portal_access.sql) may change phone/city (Phase 2) plus every business/payment/fiscal onboarding column added in 20260818121200_interpreter_onboarding_fields.sql, but never identity/qualification fields or the three self_billing_* columns - those are only ever set via the app.interpreter_self_billing_rpc bypass, which only interpreter_accept_self_billing_agreement() ever engages.';

-- Sole write path for self-billing consent - mirrors
-- customer_accept_booking_offer()'s pattern: guarded by
-- current_interpreter_id() (the same access gate as the rest of the
-- interpreter portal), and accepted_by is always auth.uid() itself, never
-- a parameter - it can never be set to someone else's id, even by
-- construction of the function signature. SECURITY DEFINER is not what
-- lets this past the trigger above (see that function's own comment for
-- why) - the transaction-local set_config immediately before the UPDATE is.
create or replace function public.interpreter_accept_self_billing_agreement(p_terms_version text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_terms_version is null or btrim(p_terms_version) = '' then
    raise exception 'terms_version_required' using errcode = '22023';
  end if;

  perform set_config('app.interpreter_self_billing_rpc', 'true', true);

  update public.interpreters
  set
    self_billing_accepted_at = now(),
    self_billing_terms_version = btrim(p_terms_version),
    self_billing_accepted_by = auth.uid()
  where id = v_interpreter_id;
end;
$$;

comment on function public.interpreter_accept_self_billing_agreement(text) is
  'Interpreter-only. Explicit consent to self-billing - never silently enabled. Stamps self_billing_accepted_at/terms_version/accepted_by(=auth.uid()) on the caller''s own interpreter row. This is the only way those three columns can ever be set by a non-admin.';

revoke all on function public.interpreter_accept_self_billing_agreement(text) from public;
grant execute on function public.interpreter_accept_self_billing_agreement(text) to authenticated;
