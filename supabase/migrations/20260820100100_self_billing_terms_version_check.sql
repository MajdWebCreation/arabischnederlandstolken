-- Closes a gap: submit_interpreter_settlement_for_review() and
-- issue_interpreter_invoice() (20260819100500_interpreter_invoice_workflow_rpcs.sql)
-- previously only checked "has the interpreter accepted self-billing at
-- all" (self_billing_accepted_at is not null), never whether that
-- acceptance was of the *current* agreement text
-- (CURRENT_SELF_BILLING_TERMS_VERSION in lib/legal/terms.ts). An
-- interpreter who only ever accepted an earlier, materially different
-- version would incorrectly pass this check. Both functions now take the
-- caller-supplied current version as an explicit parameter (the TS/legal
-- text lives in the application layer, not the database - see
-- CURRENT_TERMS_VERSION's own reasoning) and compare it against the
-- interpreter's stored self_billing_terms_version.
--
-- Adding a parameter changes the signature, so this project's established
-- rule applies: DROP + CREATE, not CREATE OR REPLACE (Postgres would
-- otherwise treat the new signature as a distinct overload rather than a
-- replacement) - see 20260817110000_website_booking_request_optional_args.sql
-- for the precedent this follows.
drop function if exists public.submit_interpreter_settlement_for_review(uuid);
drop function if exists public.issue_interpreter_invoice(uuid);

create function public.submit_interpreter_settlement_for_review(
  p_invoice_id uuid,
  p_current_terms_version text
)
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

  if v_interpreter.self_billing_terms_version is distinct from p_current_terms_version then
    raise exception 'self_billing_terms_outdated';
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

comment on function public.submit_interpreter_settlement_for_review(uuid, text) is
  'Admin-only. Validates line items exist and the interpreter''s self-billing consent (of the current terms version specifically)/business/payment/fiscal setup is complete, then moves draft/change_requested -> pending_review. submitted_for_review is logged automatically.';

revoke all on function public.submit_interpreter_settlement_for_review(uuid, text) from public;
grant execute on function public.submit_interpreter_settlement_for_review(uuid, text) to authenticated;

create function public.issue_interpreter_invoice(
  p_invoice_id uuid,
  p_current_terms_version text
)
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

  if v_interpreter.self_billing_terms_version is distinct from p_current_terms_version then
    raise exception 'self_billing_terms_outdated';
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

comment on function public.issue_interpreter_invoice(uuid, text) is
  'Admin-only. Only reachable from status=approved. Validates self-billing consent (of the current terms version specifically), business/payment/fiscal completeness, assigns the next race-safe ANT-SB-<year>-<seq> number, freezes the supplier/buyer/booking snapshot, and moves approved -> issued, all atomically. issued is logged automatically.';

revoke all on function public.issue_interpreter_invoice(uuid, text) from public;
grant execute on function public.issue_interpreter_invoice(uuid, text) to authenticated;
