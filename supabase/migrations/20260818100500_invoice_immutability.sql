-- Once an invoice leaves 'draft', its financial and identity content must
-- never silently change - only the operational lifecycle fields (status
-- itself, sent_at/sent_to_email, paid_at, cancelled_at, pdf_storage_path,
-- updated_at) may still move. This is the DB-level backstop behind that
-- guarantee: even a direct authenticated-admin API call (not just the
-- admin UI, which simply doesn't render an edit form for a non-draft
-- invoice) cannot rewrite what was actually issued.
create or replace function public.enforce_invoice_immutability()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status = 'draft' then
    return new; -- freely editable while draft
  end if;

  if new.invoice_number is distinct from old.invoice_number
     or new.customer_id is distinct from old.customer_id
     or new.booking_id is distinct from old.booking_id
     or new.invoice_date is distinct from old.invoice_date
     or new.due_date is distinct from old.due_date
     or new.payment_term_days is distinct from old.payment_term_days
     or new.currency is distinct from old.currency
     or new.subtotal_ex_vat is distinct from old.subtotal_ex_vat
     or new.total_vat is distinct from old.total_vat
     or new.total_inc_vat is distinct from old.total_inc_vat
     or new.customer_note is distinct from old.customer_note
     or new.seller_snapshot is distinct from old.seller_snapshot
     or new.customer_snapshot is distinct from old.customer_snapshot
  then
    raise exception 'issued_invoice_is_immutable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_invoice_immutability() is
  'BEFORE UPDATE guard on invoices: once status is no longer draft, rejects any change to financial/snapshot/identity columns. Status transitions and the sent_at/sent_to_email/paid_at/cancelled_at/pdf_storage_path bookkeeping fields remain updatable.';

create trigger enforce_invoice_immutability_trigger
  before update on public.invoices
  for each row
  execute function public.enforce_invoice_immutability();

-- Same guarantee for line items: once the parent invoice is no longer
-- draft, its items are frozen - no insert, update, or delete. Without this,
-- an issued invoice's *displayed* totals would stay immutable (per the
-- trigger above) while its line items underneath could still be edited,
-- which is exactly the "rewritten as though it had always contained
-- different values" scenario the invoice model must not allow.
create or replace function public.enforce_invoice_items_immutability()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
  v_status text;
begin
  select status into v_status from public.invoices where id = v_invoice_id;

  if v_status is distinct from 'draft' then
    raise exception 'issued_invoice_items_are_immutable' using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.enforce_invoice_items_immutability() is
  'BEFORE INSERT/UPDATE/DELETE guard on invoice_items: blocks any change once the parent invoice is no longer draft.';

create trigger enforce_invoice_items_immutability_trigger
  before insert or update or delete on public.invoice_items
  for each row
  execute function public.enforce_invoice_items_immutability();
