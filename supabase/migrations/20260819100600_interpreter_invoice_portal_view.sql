-- Interpreter-safe view for /tolk/facturen, mirroring my_assigned_bookings'
-- reasoning exactly (20260817100800_interpreter_portal_views.sql): runs as
-- owner (security_invoker = false) so it can join bookings (fully
-- admin-only RLS, completely unchanged) at all, but the WHERE clause -
-- keyed off current_interpreter_id(), which reads the real caller's JWT -
-- is what actually restricts the rows.
--
-- Exposes booking date/modality/languages/duration live from bookings, for
-- display on pre-issue settlements (draft is already excluded - an
-- interpreter never sees one at all). Once issued, the settlement's own
-- frozen booking_snapshot/supplier_*/buyer_* columns (already directly
-- selectable off interpreter_invoices, which this view also exposes) are
-- what the detail page and PDF actually use for anything
-- legally/accounting-relevant - see brief section 10. No customer identity,
-- customer price, or margin of any kind - only what a settlement summary
-- needs.
create view public.my_interpreter_invoices
with (security_invoker = false)
as
select
  ii.id,
  ii.invoice_number,
  ii.status,
  ii.currency,
  ii.subtotal_ex_vat,
  ii.vat_treatment_snapshot,
  ii.vat_rate,
  ii.vat_amount,
  ii.total_inc_vat,
  ii.fiscal_note,
  ii.booking_id,
  ii.interpreter_approved_at,
  ii.last_change_request_message,
  ii.issued_at,
  ii.paid_at,
  ii.pdf_storage_path,
  ii.booking_snapshot,
  ii.created_at,
  b.booking_number,
  b.requested_date,
  b.modality,
  b.language_from,
  b.language_to,
  b.actual_duration_minutes,
  b.expected_duration_minutes
from public.interpreter_invoices ii
join public.bookings b on b.id = ii.booking_id
where ii.interpreter_id = public.current_interpreter_id()
  and ii.status <> 'draft';

comment on view public.my_interpreter_invoices is
  'Interpreter-safe view of the caller''s own non-draft settlements/self-billing invoices, with the linked booking''s descriptive fields (date/modality/languages/duration only - no customer identity). Line items come from interpreter_invoice_items via its own RLS policy, not this view.';

revoke all on public.my_interpreter_invoices from anon;
grant select on public.my_interpreter_invoices to authenticated;
