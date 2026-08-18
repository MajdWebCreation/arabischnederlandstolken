-- Mirrors enforce_invoice_immutability() (20260818100500_invoice_immutability.sql)
-- exactly in spirit: financial/identity/snapshot fields are freely editable
-- only while status is 'draft' or 'change_requested' (the two states admin
-- can still meaningfully edit a settlement in - see brief section 12,
-- "Admin reviews and changes the draft if appropriate, then resubmits it").
-- Lifecycle/bookkeeping fields (status itself, and everything the workflow
-- actions below need to write) remain updatable regardless of status - this
-- is what lets every workflow transition (submit for review, approve,
-- request change, issue, mark paid, cancel) proceed as a plain, narrowly-
-- scoped UPDATE without needing a transaction-local trigger-bypass flag: the
-- exact columns each transition touches are already on the always-allowed
-- list below.
create or replace function public.enforce_interpreter_invoice_immutability()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status in ('draft', 'change_requested') then
    return new; -- freely editable
  end if;

  -- issue_interpreter_invoice() (20260819100500_interpreter_invoice_workflow_rpcs.sql)
  -- is the one legitimate exception: it writes invoice_number and the
  -- supplier/buyer/booking_snapshot columns for the first and only time,
  -- transitioning approved -> issued - a transition this trigger would
  -- otherwise block (old.status = 'approved' is not in the freely-editable
  -- set above, precisely so nothing else can ever touch these columns
  -- again afterward). Set only immediately before that one UPDATE, and
  -- only by that one SECURITY DEFINER function - not reachable by a client
  -- directly, since set_config() is a Postgres builtin, never a callable
  -- PostgREST RPC. Mirrors the app.interpreter_self_billing_rpc bypass in
  -- 20260818121200_interpreter_onboarding_fields.sql exactly.
  if coalesce(current_setting('app.interpreter_invoice_issue_rpc', true), '') = 'true' then
    return new;
  end if;

  if new.invoice_number is distinct from old.invoice_number
     or new.interpreter_id is distinct from old.interpreter_id
     or new.booking_id is distinct from old.booking_id
     or new.currency is distinct from old.currency
     or new.subtotal_ex_vat is distinct from old.subtotal_ex_vat
     or new.vat_treatment_snapshot is distinct from old.vat_treatment_snapshot
     or new.vat_rate is distinct from old.vat_rate
     or new.vat_amount is distinct from old.vat_amount
     or new.total_inc_vat is distinct from old.total_inc_vat
     or new.fiscal_note is distinct from old.fiscal_note
     or new.supplier_legal_name is distinct from old.supplier_legal_name
     or new.supplier_trade_name is distinct from old.supplier_trade_name
     or new.supplier_street is distinct from old.supplier_street
     or new.supplier_house_number is distinct from old.supplier_house_number
     or new.supplier_house_number_addition is distinct from old.supplier_house_number_addition
     or new.supplier_postal_code is distinct from old.supplier_postal_code
     or new.supplier_city is distinct from old.supplier_city
     or new.supplier_kvk_number is distinct from old.supplier_kvk_number
     or new.supplier_vat_id is distinct from old.supplier_vat_id
     or new.supplier_iban is distinct from old.supplier_iban
     or new.supplier_account_holder_name is distinct from old.supplier_account_holder_name
     or new.buyer_name is distinct from old.buyer_name
     or new.buyer_address is distinct from old.buyer_address
     or new.buyer_kvk is distinct from old.buyer_kvk
     or new.buyer_vat_id is distinct from old.buyer_vat_id
     or new.booking_snapshot is distinct from old.booking_snapshot
  then
    raise exception 'interpreter_invoice_is_locked' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_interpreter_invoice_immutability() is
  'BEFORE UPDATE guard on interpreter_invoices: once status leaves draft/change_requested, rejects any change to financial/snapshot/identity columns. status, issued_at/paid_at/paid_by/cancelled_at/pdf_storage_path, self_billing_terms_version/interpreter_approved_at/interpreter_approved_by, and last_change_request_message remain updatable at any status - these are exactly what the workflow RPCs/actions write.';

create trigger enforce_interpreter_invoice_immutability_trigger
  before update on public.interpreter_invoices
  for each row
  execute function public.enforce_interpreter_invoice_immutability();

-- Same guarantee for line items: once the parent settlement has left
-- draft/change_requested, its items are frozen - no insert, update, or
-- delete. Mirrors enforce_invoice_items_immutability() exactly.
create or replace function public.enforce_interpreter_invoice_items_immutability()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id uuid := coalesce(new.interpreter_invoice_id, old.interpreter_invoice_id);
  v_status text;
begin
  select status into v_status from public.interpreter_invoices where id = v_invoice_id;

  if v_status not in ('draft', 'change_requested') then
    raise exception 'interpreter_invoice_items_are_locked' using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

comment on function public.enforce_interpreter_invoice_items_immutability() is
  'BEFORE INSERT/UPDATE/DELETE guard on interpreter_invoice_items: blocks any change once the parent settlement has left draft/change_requested.';

create trigger enforce_interpreter_invoice_items_immutability_trigger
  before insert or update or delete on public.interpreter_invoice_items
  for each row
  execute function public.enforce_interpreter_invoice_items_immutability();
