-- Updates issue_invoice() for the structured billing address fields added
-- in 20260818110000_customer_structured_billing_address.sql: required-
-- billing-info validation now checks billing_street/billing_house_number/
-- billing_postal_code/billing_city (billing_house_number_addition stays
-- optional) instead of the deprecated single billing_address field, and
-- customer_snapshot stores those same structured fields instead of one
-- address string. Same signature as before, so CREATE OR REPLACE is safe -
-- everything else in the function (numbering, seller_snapshot, atomicity)
-- is unchanged from 20260818100600_issue_invoice.sql.
create or replace function public.issue_invoice(p_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice public.invoices;
  v_customer public.customers;
  v_business public.business_settings;
  v_item_count integer;
  v_today date := (now() at time zone 'Europe/Amsterdam')::date;
  v_year integer;
  v_next_value integer;
  v_number text;
  v_invoice_date date;
  v_due_date date;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into v_invoice from public.invoices where id = p_invoice_id for update;

  if not found then
    raise exception 'invoice_not_found';
  end if;

  if v_invoice.status <> 'draft' then
    raise exception 'invoice_not_draft';
  end if;

  select count(*) into v_item_count
  from public.invoice_items
  where invoice_id = p_invoice_id;

  if v_item_count = 0 then
    raise exception 'invoice_has_no_items';
  end if;

  select * into v_customer from public.customers where id = v_invoice.customer_id;

  if v_customer.billing_street is null or btrim(v_customer.billing_street) = ''
     or v_customer.billing_house_number is null or btrim(v_customer.billing_house_number) = ''
     or v_customer.billing_postal_code is null or btrim(v_customer.billing_postal_code) = ''
     or v_customer.billing_city is null or btrim(v_customer.billing_city) = ''
  then
    raise exception 'missing_billing_address';
  end if;

  select * into v_business from public.business_settings order by created_at limit 1;

  if not found then
    raise exception 'business_settings_missing';
  end if;

  v_year := extract(year from v_today)::integer;

  insert into public.invoice_number_counters (year, last_value)
  values (v_year, 1)
  on conflict (year)
  do update set last_value = public.invoice_number_counters.last_value + 1
  returning last_value into v_next_value;

  v_number := v_business.invoice_prefix || '-' || v_year::text || '-' || lpad(v_next_value::text, 6, '0');
  v_invoice_date := coalesce(v_invoice.invoice_date, v_today);
  v_due_date := coalesce(v_invoice.due_date, v_invoice_date + v_invoice.payment_term_days);

  update public.invoices
  set
    invoice_number = v_number,
    status = 'issued',
    invoice_date = v_invoice_date,
    due_date = v_due_date,
    seller_snapshot = jsonb_build_object(
      'company_name', v_business.company_name,
      'address_line', v_business.address_line,
      'postal_code', v_business.postal_code,
      'city', v_business.city,
      'country', v_business.country,
      'kvk_number', v_business.kvk_number,
      'vat_id', v_business.vat_id,
      'iban', v_business.iban,
      'website', v_business.website,
      'email', v_business.email,
      'footer_text', v_business.footer_text
    ),
    customer_snapshot = jsonb_build_object(
      'name', coalesce(nullif(btrim(v_customer.billing_name), ''), v_customer.name),
      'organisation', v_customer.organisation,
      'email', coalesce(nullif(btrim(v_customer.billing_email), ''), v_customer.email),
      'street', v_customer.billing_street,
      'house_number', v_customer.billing_house_number,
      'house_number_addition', v_customer.billing_house_number_addition,
      'postal_code', v_customer.billing_postal_code,
      'city', v_customer.billing_city,
      'kvk_number', v_customer.kvk_number,
      'vat_number', v_customer.vat_number
    )
  where id = p_invoice_id
  returning * into v_invoice;

  return v_invoice;
end;
$$;

comment on function public.issue_invoice(uuid) is
  'Admin-only. Validates structured billing info and line items, assigns the next race-safe sequential invoice number for the current year, freezes seller/customer snapshots, and moves status draft -> issued, all atomically. invoice_issued is logged automatically by log_invoice_changes_trigger.';
