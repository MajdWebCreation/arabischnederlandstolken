-- Two-step total calculation, split the same way as the customer invoice
-- system (see 20260818100300_invoice_totals_trigger.sql):
--
-- 1. recalculate_interpreter_invoice_subtotal(): AFTER trigger on
--    interpreter_invoice_items, sums line amounts into the parent's
--    subtotal_ex_vat whenever a line item changes.
-- 2. recalculate_interpreter_invoice_vat(): BEFORE trigger on
--    interpreter_invoices itself, recomputes vat_amount/total_inc_vat
--    whenever subtotal_ex_vat OR vat_treatment_snapshot/vat_rate change -
--    which the UPDATE from step 1 triggers naturally, since it's an
--    ordinary UPDATE statement.
--
-- Never trusts a browser-submitted total for either figure.
create or replace function public.recalculate_interpreter_invoice_subtotal()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.interpreter_invoice_id, old.interpreter_invoice_id);
  v_subtotal numeric(10, 2);
begin
  select coalesce(sum(amount_ex_vat), 0)
  into v_subtotal
  from public.interpreter_invoice_items
  where interpreter_invoice_id = v_invoice_id;

  update public.interpreter_invoices
  set subtotal_ex_vat = v_subtotal
  where id = v_invoice_id;

  return null; -- AFTER trigger; return value is ignored
end;
$$;

comment on function public.recalculate_interpreter_invoice_subtotal() is
  'Recomputes interpreter_invoices.subtotal_ex_vat from the sum of interpreter_invoice_items whenever a line item is inserted, updated, or deleted.';

create trigger recalculate_interpreter_invoice_subtotal_trigger
  after insert or update or delete on public.interpreter_invoice_items
  for each row
  execute function public.recalculate_interpreter_invoice_subtotal();

-- KOR/no_vat/other charge no VAT amount at all - see the brief's explicit
-- "do NOT present KOR as ordinary 0% VAT" instruction, honoured on the PDF
-- side by dedicated wording (see lib/interpreter-invoices/pdf-document.tsx),
-- not by this calculation, which is identical (zero) for all three - only
-- standard_vat with a rate actually charges VAT.
create or replace function public.recalculate_interpreter_invoice_vat()
returns trigger
language plpgsql
as $$
begin
  if new.vat_treatment_snapshot = 'standard_vat' and new.vat_rate is not null then
    new.vat_amount := round(new.subtotal_ex_vat * new.vat_rate / 100, 2);
  else
    new.vat_amount := 0;
  end if;

  new.total_inc_vat := new.subtotal_ex_vat + new.vat_amount;

  return new;
end;
$$;

comment on function public.recalculate_interpreter_invoice_vat() is
  'BEFORE INSERT/UPDATE on interpreter_invoices: derives vat_amount/total_inc_vat from subtotal_ex_vat and vat_treatment_snapshot/vat_rate. Zero VAT for kor/no_vat/other and for standard_vat with no rate set yet.';

create trigger recalculate_interpreter_invoice_vat_trigger
  before insert or update on public.interpreter_invoices
  for each row
  execute function public.recalculate_interpreter_invoice_vat();
