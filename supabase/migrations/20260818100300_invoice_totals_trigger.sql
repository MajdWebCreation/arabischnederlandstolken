-- Keeps invoices.subtotal_ex_vat/total_vat/total_inc_vat in sync with the
-- sum of their invoice_items automatically, so no Server Action ever needs
-- to (and none does) compute and write an invoice's totals itself - "the
-- browser's numbers" are never trusted for anything beyond a live UI
-- preview. Fires on every insert/update/delete of a line item.
create or replace function public.recalculate_invoice_totals()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_subtotal numeric(10, 2);
  v_vat numeric(10, 2);
begin
  select
    coalesce(sum(line_subtotal_ex_vat), 0),
    coalesce(sum(line_vat_amount), 0)
  into v_subtotal, v_vat
  from public.invoice_items
  where invoice_id = v_invoice_id;

  update public.invoices
  set
    subtotal_ex_vat = v_subtotal,
    total_vat = v_vat,
    total_inc_vat = v_subtotal + v_vat
  where id = v_invoice_id;

  return null; -- AFTER trigger; return value is ignored
end;
$$;

comment on function public.recalculate_invoice_totals() is
  'Recomputes invoices.subtotal_ex_vat/total_vat/total_inc_vat from the sum of invoice_items whenever a line item is inserted, updated, or deleted.';

create trigger recalculate_invoice_totals_trigger
  after insert or update or delete on public.invoice_items
  for each row
  execute function public.recalculate_invoice_totals();
