-- Customer-facing invoice archive (Phase 4 addendum): lets an authenticated
-- customer see their own issued invoices and securely fetch the exact
-- stored PDF Phase 3A already produced - never a second PDF, never a
-- regenerated one, never a raw storage path handed to the browser.
--
-- CREATE OR REPLACE VIEW is safe here (unlike the function-signature
-- changes elsewhere in this project): the existing output column list is
-- kept byte-for-byte, with only a new trailing column (booking_number) and
-- an added WHERE condition - Postgres only requires that a replaced view's
-- pre-existing columns keep their name/type/position, which this does.
--
-- status <> 'draft' is the actual enforcement of "customers must never see
-- draft invoices" - not a UI filter. booking_number is a left join purely
-- for display ("linked booking/reference if available"); it never exposes
-- anything about the booking beyond its own human-readable number.
create or replace view public.my_customer_invoices
with (security_invoker = false)
as
select
  inv.id,
  inv.invoice_number,
  inv.status,
  inv.invoice_date,
  inv.due_date,
  inv.currency,
  inv.subtotal_ex_vat,
  inv.total_vat,
  inv.total_inc_vat,
  inv.booking_id,
  inv.customer_id,
  inv.created_at,
  b.booking_number
from public.invoices inv
left join public.bookings b on b.id = inv.booking_id
where inv.customer_id in (select public.current_customer_ids())
  and inv.status <> 'draft';

comment on view public.my_customer_invoices is
  'Read-only, customer-safe summary of the caller''s own organisation''s issued invoices (status <> draft is an enforced filter, not a UI convenience). No pdf_storage_path/seller_snapshot/customer_snapshot/invoice_items - see get_my_issued_invoice_pdf_path() for the one narrow, authorized path to the stored PDF bytes.';

-- The invoices and invoice_items tables stay exactly as locked down as
-- before this migration (admin-only RLS, unchanged) - a customer's own
-- session still cannot SELECT from either directly. This SECURITY
-- DEFINER function is the sole, narrow allowlist for "does this specific
-- invoice belong to me, and if so, where is its stored PDF" - mirroring
-- is_my_customer_booking()'s reasoning exactly: it reads the RLS-protected
-- invoices table as its owner so the ownership check can actually run,
-- while still answering only for the real caller (current_customer_ids()
-- reads their own JWT via auth.uid()).
--
-- Deliberately returns the same not_authorized error whether the invoice
-- doesn't exist, belongs to someone else, or is still a draft - never
-- distinguishable, so a customer probing invoice ids learns nothing about
-- what does or doesn't exist.
create or replace function public.get_my_issued_invoice_pdf_path(p_invoice_id uuid)
returns table (pdf_storage_path text, invoice_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice record;
begin
  select i.pdf_storage_path, i.invoice_number, i.customer_id, i.status
  into v_invoice
  from public.invoices i
  where i.id = p_invoice_id;

  if v_invoice.customer_id is null
     or v_invoice.customer_id not in (select public.current_customer_ids())
     or v_invoice.status = 'draft'
  then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  return query select v_invoice.pdf_storage_path, v_invoice.invoice_number;
end;
$$;

comment on function public.get_my_issued_invoice_pdf_path(uuid) is
  'Customer-only. Returns the stored PDF path (and invoice_number, for the download filename) for one of the caller''s own non-draft invoices. Raises not_authorized - identically for "not found", "someone else''s invoice", and "still a draft" - otherwise. Callers must still hold Storage read access via the matching storage.objects policy below to actually download the bytes.';

revoke all on function public.get_my_issued_invoice_pdf_path(uuid) from public;
grant execute on function public.get_my_issued_invoice_pdf_path(uuid) to authenticated;

-- A plain "exists (select 1 from public.invoices where pdf_storage_path =
-- storage.objects.name and ...)" USING clause would silently evaluate to
-- false for every non-admin here: invoices itself is RLS-protected
-- (admin-only), so a non-admin's own subquery against it is filtered down
-- to nothing before the path/customer comparison is even reached - the
-- exact same trap is_my_customer_booking() already exists to avoid for
-- cancellation_requests (see 20260818120600_cancellation_requests.sql).
-- This SECURITY DEFINER helper reads invoices as its owner (bypassing
-- that RLS) so the real check can run, while still only ever answering for
-- the actual caller via current_customer_ids().
create or replace function public.is_my_customer_invoice_pdf(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.invoices i
    where i.pdf_storage_path = p_object_name
      and i.status <> 'draft'
      and i.customer_id in (select public.current_customer_ids())
  );
$$;

revoke all on function public.is_my_customer_invoice_pdf(text) from public;
grant execute on function public.is_my_customer_invoice_pdf(text) to authenticated;

-- Lets the caller's own authenticated client actually download the object
-- once get_my_issued_invoice_pdf_path() has told the server-side route
-- handler which path is theirs to read. Ties the exact Storage object name
-- back to one specific invoice's customer_id, so changing/guessing a path
-- only ever matches an invoice that isn't the caller's - it can never
-- resolve to another customer's PDF. Strictly additive to the existing
-- admin-only policies from 20260818100700_invoice_storage.sql; interpreter
-- accounts (current_customer_ids() empty for them) and anonymous visitors
-- (policy is `to authenticated` only) get nothing from this.
create policy "Customers can read their own issued invoice PDFs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'invoices' and public.is_my_customer_invoice_pdf(storage.objects.name));
