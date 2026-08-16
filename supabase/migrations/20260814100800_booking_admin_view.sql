-- A flat, pre-joined view for the admin bookings list page.
--
-- PostgREST's OR-filter syntax (used for the combined booking
-- number/customer name/organisation/email search box) is only reliably
-- supported across a single table's own flat columns, not across embedded
-- relationships. Rather than depend on that, this view joins the three
-- tables once so search and filtering both become plain column filters.
--
-- security_invoker means this view carries no privilege of its own: every
-- query against it re-checks the calling role's Row Level Security on
-- bookings/customers/interpreters exactly as if queried directly. A
-- non-admin authenticated user gets zero rows here for the same reason
-- they get zero rows from the underlying tables.
create view public.booking_admin_rows
with (security_invoker = true)
as
select
  b.id,
  b.booking_number,
  b.status,
  b.source,
  b.request_type,
  b.context,
  b.language_from,
  b.language_to,
  b.modality,
  b.sworn_required,
  b.requested_date,
  b.requested_start_time,
  b.customer_price_ex_vat,
  b.interpreter_cost_ex_vat,
  b.customer_travel_fee_ex_vat,
  b.interpreter_travel_cost_ex_vat,
  b.created_at,
  b.customer_id,
  c.name as customer_name,
  c.organisation as customer_organisation,
  c.email as customer_email,
  b.interpreter_id,
  i.first_name as interpreter_first_name,
  i.last_name as interpreter_last_name
from public.bookings b
join public.customers c on c.id = b.customer_id
left join public.interpreters i on i.id = b.interpreter_id;

comment on view public.booking_admin_rows is
  'Read-only, pre-joined view of bookings for the admin list/search page. security_invoker=true means it carries no privilege of its own - RLS on the underlying tables still applies to every query.';

revoke all on public.booking_admin_rows from anon, authenticated;
grant select on public.booking_admin_rows to authenticated;
