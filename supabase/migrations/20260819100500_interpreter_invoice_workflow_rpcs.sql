-- The four state-changing RPCs that move a settlement through its
-- workflow: submit for review, interpreter approves, interpreter requests a
-- change, and admin issues the official numbered invoice. Every other
-- transition (mark paid, cancel) is a plain, narrowly-scoped admin UPDATE
-- from a Server Action - see app/admin/(dashboard)/interpreter-invoices/[id]/actions.ts
-- - since those only ever touch the always-updatable lifecycle columns
-- enforce_interpreter_invoice_immutability() already allows regardless of
-- status, exactly like markInvoicePaidAction/cancelInvoiceAction for
-- customer invoices.
--
-- SECURITY INVOKER is used wherever the caller already holds every grant
-- the function needs (admin, via the is_admin() "for all" RLS policy) -
-- SECURITY DEFINER is reserved for interpreter_approve_settlement() and
-- interpreter_request_settlement_change(), which write to a table
-- interpreters have no UPDATE policy on at all.

-- Admin-only. Re-validates everything issue_interpreter_invoice() will
-- eventually require, so a settlement is never sent to an interpreter for
-- review only to be a dead end at issue time because of an incomplete
-- profile - see brief section 21. Mirrors the paymentReady logic in
-- lib/interpreters/completeness.ts exactly (zakelijk + betaalgegevens +
-- facturatie), re-implemented here as a second, independent check (defense
-- in depth - the TypeScript check alone is a UI convenience, not the
-- authorization boundary).
create or replace function public.submit_interpreter_settlement_for_review(p_invoice_id uuid)
returns public.interpreter_invoices
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_invoice public.interpreter_invoices;
  v_interpreter public.interpreters;
  v_item_count integer;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into v_invoice from public.interpreter_invoices where id = p_invoice_id for update;

  if not found then
    raise exception 'settlement_not_found';
  end if;

  if v_invoice.status not in ('draft', 'change_requested') then
    raise exception 'settlement_not_editable';
  end if;

  select count(*) into v_item_count
  from public.interpreter_invoice_items
  where interpreter_invoice_id = p_invoice_id;

  if v_item_count = 0 then
    raise exception 'settlement_has_no_items';
  end if;

  select * into v_interpreter from public.interpreters where id = v_invoice.interpreter_id;

  if v_interpreter.self_billing_accepted_at is null then
    raise exception 'self_billing_not_accepted';
  end if;

  if v_invoice.vat_treatment_snapshot is null then
    raise exception 'vat_treatment_missing';
  end if;

  if v_interpreter.legal_business_name is null or btrim(v_interpreter.legal_business_name) = ''
     or v_interpreter.business_street is null or btrim(v_interpreter.business_street) = ''
     or v_interpreter.business_house_number is null or btrim(v_interpreter.business_house_number) = ''
     or v_interpreter.business_postal_code is null or btrim(v_interpreter.business_postal_code) = ''
     or v_interpreter.business_city is null or btrim(v_interpreter.business_city) = ''
  then
    raise exception 'business_details_incomplete';
  end if;

  if v_interpreter.iban is null or btrim(v_interpreter.iban) = ''
     or v_interpreter.account_holder_name is null or btrim(v_interpreter.account_holder_name) = ''
  then
    raise exception 'payment_details_incomplete';
  end if;

  update public.interpreter_invoices
  set status = 'pending_review'
  where id = p_invoice_id
  returning * into v_invoice;

  return v_invoice;
end;
$$;

comment on function public.submit_interpreter_settlement_for_review(uuid) is
  'Admin-only. Validates line items exist and the interpreter''s self-billing consent/business/payment/fiscal setup is complete, then moves draft/change_requested -> pending_review. submitted_for_review is logged automatically.';

revoke all on function public.submit_interpreter_settlement_for_review(uuid) from public;
grant execute on function public.submit_interpreter_settlement_for_review(uuid) to authenticated;

-- Interpreter-only. SECURITY DEFINER because interpreters hold no UPDATE
-- RLS policy on interpreter_invoices at all - this narrow function is the
-- sole write path, exactly like interpreter_accept_self_billing_agreement().
-- self_billing_terms_version is stamped from the interpreter's OWN current
-- acceptance (never a parameter), so it can never be set to a version they
-- did not actually accept.
create or replace function public.interpreter_approve_settlement(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
  v_invoice public.interpreter_invoices;
  v_terms_version text;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into v_invoice
  from public.interpreter_invoices
  where id = p_invoice_id and interpreter_id = v_interpreter_id
  for update;

  if not found then
    raise exception 'settlement_not_found';
  end if;

  if v_invoice.status <> 'pending_review' then
    raise exception 'settlement_not_pending_review';
  end if;

  select self_billing_terms_version into v_terms_version
  from public.interpreters
  where id = v_interpreter_id;

  if v_terms_version is null then
    raise exception 'self_billing_not_accepted';
  end if;

  update public.interpreter_invoices
  set
    status = 'approved',
    interpreter_approved_at = now(),
    interpreter_approved_by = auth.uid(),
    self_billing_terms_version = v_terms_version
  where id = p_invoice_id;
end;
$$;

comment on function public.interpreter_approve_settlement(uuid) is
  'Interpreter-only, own settlement only. Moves pending_review -> approved and stamps interpreter_approved_at/by(=auth.uid())/self_billing_terms_version(=the interpreter''s own current acceptance). interpreter_approved is logged automatically.';

revoke all on function public.interpreter_approve_settlement(uuid) from public;
grant execute on function public.interpreter_approve_settlement(uuid) to authenticated;

-- Interpreter-only. Same SECURITY DEFINER reasoning as the approval RPC
-- above. Leaves the settlement's own line items/amounts completely
-- untouched - admin decides what, if anything, to change based on
-- p_message; the interpreter never edits a financial amount directly (brief
-- section 12).
create or replace function public.interpreter_request_settlement_change(p_invoice_id uuid, p_message text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
  v_invoice public.interpreter_invoices;
  v_message text;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  v_message := btrim(coalesce(p_message, ''));

  if v_message = '' then
    raise exception 'message_required' using errcode = '22023';
  end if;

  select * into v_invoice
  from public.interpreter_invoices
  where id = p_invoice_id and interpreter_id = v_interpreter_id
  for update;

  if not found then
    raise exception 'settlement_not_found';
  end if;

  if v_invoice.status <> 'pending_review' then
    raise exception 'settlement_not_pending_review';
  end if;

  update public.interpreter_invoices
  set
    status = 'change_requested',
    last_change_request_message = v_message
  where id = p_invoice_id;
end;
$$;

comment on function public.interpreter_request_settlement_change(uuid, text) is
  'Interpreter-only, own settlement only. Moves pending_review -> change_requested with a required explanatory message, stored on last_change_request_message and logged (with the message) to interpreter_invoice_events. Never touches any financial field.';

revoke all on function public.interpreter_request_settlement_change(uuid, text) from public;
grant execute on function public.interpreter_request_settlement_change(uuid, text) to authenticated;

-- Admin-only. Mirrors issue_invoice() exactly in structure: validates
-- everything required, assigns the next race-safe sequential number for the
-- current year (ANT-SB-<year>-<seq>, a completely separate sequence from
-- ANT-F customer invoices), freezes the supplier/buyer/booking snapshot,
-- and moves approved -> issued, all atomically - never a numbered invoice
-- without its snapshot, never a snapshot without a number. Only reachable
-- from 'approved' (i.e. only after the interpreter has actually agreed to
-- these exact amounts) - never issues a number for a settlement still
-- awaiting agreement (brief section 13).
create or replace function public.issue_interpreter_invoice(p_invoice_id uuid)
returns public.interpreter_invoices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice public.interpreter_invoices;
  v_interpreter public.interpreters;
  v_booking public.bookings;
  v_business public.business_settings;
  v_today date := (now() at time zone 'Europe/Amsterdam')::date;
  v_year integer;
  v_next_value integer;
  v_number text;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into v_invoice from public.interpreter_invoices where id = p_invoice_id for update;

  if not found then
    raise exception 'settlement_not_found';
  end if;

  if v_invoice.status <> 'approved' then
    raise exception 'settlement_not_approved';
  end if;

  select * into v_interpreter from public.interpreters where id = v_invoice.interpreter_id;

  if v_interpreter.self_billing_accepted_at is null then
    raise exception 'self_billing_not_accepted';
  end if;

  if v_interpreter.legal_business_name is null or btrim(v_interpreter.legal_business_name) = ''
     or v_interpreter.business_street is null or btrim(v_interpreter.business_street) = ''
     or v_interpreter.business_house_number is null or btrim(v_interpreter.business_house_number) = ''
     or v_interpreter.business_postal_code is null or btrim(v_interpreter.business_postal_code) = ''
     or v_interpreter.business_city is null or btrim(v_interpreter.business_city) = ''
  then
    raise exception 'business_details_incomplete';
  end if;

  if v_interpreter.iban is null or btrim(v_interpreter.iban) = ''
     or v_interpreter.account_holder_name is null or btrim(v_interpreter.account_holder_name) = ''
  then
    raise exception 'payment_details_incomplete';
  end if;

  -- VAT/fiscal completeness, per treatment - never guessed (brief section
  -- 8). standard_vat needs a confirmed rate; kor needs nothing further (its
  -- distinct wording is a PDF-rendering concern, not a data requirement);
  -- no_vat/other require admin to have documented why via fiscal_note.
  if v_invoice.vat_treatment_snapshot is null then
    raise exception 'vat_treatment_missing';
  elsif v_invoice.vat_treatment_snapshot = 'standard_vat' and v_invoice.vat_rate is null then
    raise exception 'vat_rate_missing';
  elsif v_invoice.vat_treatment_snapshot in ('no_vat', 'other')
        and (v_invoice.fiscal_note is null or btrim(v_invoice.fiscal_note) = '')
  then
    raise exception 'fiscal_note_required';
  end if;

  select * into v_booking from public.bookings where id = v_invoice.booking_id;

  select * into v_business from public.business_settings order by created_at limit 1;

  if not found then
    raise exception 'business_settings_missing';
  end if;

  v_year := extract(year from v_today)::integer;

  insert into public.interpreter_invoice_number_counters (year, last_value)
  values (v_year, 1)
  on conflict (year)
  do update set last_value = public.interpreter_invoice_number_counters.last_value + 1
  returning last_value into v_next_value;

  v_number := 'ANT-SB-' || v_year::text || '-' || lpad(v_next_value::text, 6, '0');

  -- Required so this UPDATE (approved -> issued, writing invoice_number and
  -- the supplier/buyer/booking snapshot for the first time) passes
  -- enforce_interpreter_invoice_immutability() - see that trigger's own
  -- comment for why this exact bypass is safe and narrowly scoped.
  perform set_config('app.interpreter_invoice_issue_rpc', 'true', true);

  update public.interpreter_invoices
  set
    invoice_number = v_number,
    status = 'issued',
    issued_at = now(),
    supplier_legal_name = v_interpreter.legal_business_name,
    supplier_trade_name = v_interpreter.trade_name,
    supplier_street = v_interpreter.business_street,
    supplier_house_number = v_interpreter.business_house_number,
    supplier_house_number_addition = v_interpreter.business_house_number_addition,
    supplier_postal_code = v_interpreter.business_postal_code,
    supplier_city = v_interpreter.business_city,
    supplier_kvk_number = v_interpreter.kvk_number,
    supplier_vat_id = v_interpreter.vat_id,
    supplier_iban = v_interpreter.iban,
    supplier_account_holder_name = v_interpreter.account_holder_name,
    buyer_name = v_business.company_name,
    buyer_address = v_business.address_line || ', ' || v_business.postal_code || ' ' || v_business.city,
    buyer_kvk = v_business.kvk_number,
    buyer_vat_id = v_business.vat_id,
    booking_snapshot = jsonb_build_object(
      'booking_number', v_booking.booking_number,
      'requested_date', v_booking.requested_date,
      'modality', v_booking.modality,
      'language_from', v_booking.language_from,
      'language_to', v_booking.language_to,
      'actual_duration_minutes', v_booking.actual_duration_minutes,
      'expected_duration_minutes', v_booking.expected_duration_minutes
    )
  where id = p_invoice_id
  returning * into v_invoice;

  return v_invoice;
end;
$$;

comment on function public.issue_interpreter_invoice(uuid) is
  'Admin-only. Only reachable from status=approved. Validates self-billing consent, business/payment/fiscal completeness, assigns the next race-safe ANT-SB-<year>-<seq> number, freezes the supplier/buyer/booking snapshot, and moves approved -> issued, all atomically. issued is logged automatically.';

revoke all on function public.issue_interpreter_invoice(uuid) from public;
grant execute on function public.issue_interpreter_invoice(uuid) to authenticated;
