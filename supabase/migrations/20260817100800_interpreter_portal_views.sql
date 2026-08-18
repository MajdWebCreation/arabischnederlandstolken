-- The only two ways the interpreter portal ever reads booking data. Both
-- views hardcode their own column list AND their own ownership filter, so
-- there is no dependency on RLS on bookings/customers granting interpreters
-- row access at all - bookings and customers keep the exact same
-- admin-only RLS Phase 1 built, completely unchanged. Even a future bug
-- that queries `bookings` directly from interpreter-facing code would get
-- nothing back, because no policy there permits it.
--
-- security_invoker is deliberately omitted (default: false), the opposite
-- choice from booking_admin_rows in Phase 1. These views run as their
-- owner (postgres, which is not subject to RLS on the tables it owns) so
-- they can read bookings/customers at all; the WHERE clause on each -
-- keyed off current_interpreter_id(), which reads the real caller's JWT via
-- auth.uid() regardless of this ownership-based privilege elevation - is
-- what actually restricts the rows, not the underlying table grants.

-- Pre-selection: what an interpreter needs to decide whether to take a job.
-- No customer_message, no internal_notes, no location_address (only the
-- general location_name), no customer identity or contact of any kind, and
-- none of bookings' customer-side or interpreter-side *_ex_vat columns -
-- only the assignment's own offered_compensation_ex_vat, which is specific
-- to this interpreter and this offer.
create view public.my_assignment_offers
with (security_invoker = false)
as
select
  ba.id,
  ba.booking_id,
  ba.assignment_type,
  ba.status,
  ba.offered_compensation_ex_vat,
  ba.offered_travel_compensation_ex_vat,
  ba.message_to_interpreter,
  ba.invited_at,
  ba.viewed_at,
  ba.responded_at,
  ba.expires_at,
  ba.created_at,
  b.booking_number,
  b.requested_date,
  b.requested_start_time,
  b.expected_duration_minutes,
  b.modality,
  b.language_from,
  b.language_to,
  b.language_notes,
  b.context,
  b.sworn_required,
  b.location_name,
  b.interpreter_brief,
  dt.label as required_dialect_label
from public.booking_assignments ba
join public.bookings b on b.id = ba.booking_id
left join public.capability_tags dt on dt.id = b.required_dialect_tag_id
where ba.interpreter_id = public.current_interpreter_id();

comment on view public.my_assignment_offers is
  'Interpreter-safe, pre-selection view of the caller''s own assignment offers (invitations and open-assignment inclusions). Excludes the customer''s message, internal notes, precise address, all customer/agency financial fields, and any customer identity - see the file comment for the full reasoning.';

-- Post-selection: bookings.interpreter_id is the source of truth for "this
-- is genuinely my job now", covering upcoming, completed, and cancelled
-- alike (the app groups by status). The compensation columns here are
-- deliberately bookings.interpreter_cost_ex_vat /
-- interpreter_travel_cost_ex_vat, not the customer-facing price fields -
-- the agreed amount was copied into exactly those columns atomically at
-- selection time (see select_interpreter_for_booking), so this is always
-- "what I'm actually being paid", never the customer's rate or the margin.
create view public.my_assigned_bookings
with (security_invoker = false)
as
select
  b.id as booking_id,
  b.booking_number,
  b.status,
  b.requested_date,
  b.requested_start_time,
  b.expected_duration_minutes,
  b.actual_duration_minutes,
  b.modality,
  b.language_from,
  b.language_to,
  b.language_notes,
  b.context,
  b.sworn_required,
  b.location_name,
  b.location_address,
  b.onsite_contact_name,
  b.onsite_contact_phone,
  b.interpreter_brief,
  b.interpreter_cost_ex_vat as my_compensation_ex_vat,
  b.interpreter_travel_cost_ex_vat as my_travel_compensation_ex_vat,
  b.created_at,
  b.updated_at
from public.bookings b
where b.interpreter_id = public.current_interpreter_id();

comment on view public.my_assigned_bookings is
  'Interpreter-safe view of the caller''s own confirmed/completed/cancelled bookings, keyed off bookings.interpreter_id. Exposes only this interpreter''s own agreed compensation, never the customer price, margin, or any customer contact/billing detail.';

revoke all on public.my_assignment_offers from anon;
revoke all on public.my_assigned_bookings from anon;
grant select on public.my_assignment_offers to authenticated;
grant select on public.my_assigned_bookings to authenticated;
