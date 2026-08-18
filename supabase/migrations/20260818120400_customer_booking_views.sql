-- The only two ways the customer portal ever reads booking/invoice data,
-- exactly mirroring the interpreter portal's my_assignment_offers /
-- my_assigned_bookings pattern from 20260817100800_interpreter_portal_views.sql:
-- each view hardcodes its own column list AND its own ownership filter, so
-- bookings/invoices/customers keep the exact same admin-only RLS unchanged,
-- and even a future bug that queries those tables directly from
-- customer-portal code gets nothing back.
--
-- security_invoker is deliberately omitted (default: false) for the same
-- reason as the interpreter views: these run as their owner so they can
-- read bookings/invoices/interpreters/customers at all, while the WHERE
-- clause - keyed off current_customer_ids(), which reads the real caller's
-- JWT via auth.uid() regardless of this ownership-based privilege
-- elevation - is what actually restricts the rows.
--
-- Deliberately excluded from both views: internal_notes,
-- interpreter_cost_ex_vat, interpreter_travel_cost_ex_vat,
-- interpreter_overtime_rate_ex_vat (agency margin/interpreter
-- compensation - never shown to a customer), any other customer's data,
-- and (on the invoice side) pdf_storage_path/seller_snapshot/
-- customer_snapshot - invoice PDFs are never served publicly; only the
-- admin PDF route handler reads that column. The interpreter's own contact
-- details (name/phone) only ever appear once bookings.interpreter_id is
-- actually set by the existing admin assignment workflow, which is exactly
-- when it becomes appropriate for the customer to see them - no separate
-- conditional logic is needed for that here.
create view public.my_customer_bookings
with (security_invoker = false)
as
select
  b.id as booking_id,
  b.booking_number,
  b.status,
  b.context,
  b.language_from,
  b.language_to,
  b.language_notes,
  b.modality,
  b.sworn_required,
  b.requested_date,
  b.requested_start_time,
  b.expected_duration_minutes,
  b.actual_duration_minutes,
  b.location_name,
  b.location_address,
  b.customer_message,
  b.customer_price_ex_vat,
  b.customer_travel_fee_ex_vat,
  b.customer_overtime_rate_ex_vat,
  b.vat_rate,
  b.customer_accepted_at,
  b.terms_version,
  b.terms_accepted_at,
  b.early_performance_consent_at,
  b.early_performance_full_completion_ack_at,
  b.request_withdrawn_at,
  b.repeated_from_booking_id,
  b.created_at,
  b.updated_at,
  b.customer_id,
  b.interpreter_id,
  i.first_name as interpreter_first_name,
  i.last_name as interpreter_last_name,
  i.phone as interpreter_phone,
  i.sworn_interpreter as interpreter_sworn,
  i.rbtv_number as interpreter_rbtv_number
from public.bookings b
left join public.interpreters i on i.id = b.interpreter_id
where b.customer_id in (select public.current_customer_ids());

comment on view public.my_customer_bookings is
  'Customer-safe view of the caller''s own organisation''s bookings, keyed off customer_portal_memberships via current_customer_ids(). Excludes internal_notes and every interpreter-cost/margin field. Interpreter name/phone only appear once bookings.interpreter_id is actually set by the admin assignment workflow.';

create view public.my_customer_invoices
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
  inv.created_at
from public.invoices inv
where inv.customer_id in (select public.current_customer_ids());

comment on view public.my_customer_invoices is
  'Read-only, customer-safe summary of the caller''s own organisation''s invoices. No pdf_storage_path/seller_snapshot/customer_snapshot - invoice PDFs are never served outside the admin environment.';

revoke all on public.my_customer_bookings from anon;
revoke all on public.my_customer_invoices from anon;
grant select on public.my_customer_bookings to authenticated;
grant select on public.my_customer_invoices to authenticated;
