-- Race-safe invoice numbering, mirroring booking_number_counters exactly
-- (see 20260814100400_bookings.sql / set_booking_number()). One row per
-- calendar year (Europe/Amsterdam); the atomic upsert in issue_invoice()
-- (20260818100500_issue_invoice.sql) is how a number is ever handed out -
-- never a `select max(...) + 1` in application code, which would race
-- under concurrent issuing.
create table public.invoice_number_counters (
  year integer primary key,
  last_value integer not null default 0
);

comment on table public.invoice_number_counters is
  'One row per calendar year (Europe/Amsterdam). Tracks the last issued invoice sequence number for that year. Only ever touched internally by issue_invoice().';

alter table public.invoice_number_counters enable row level security;
revoke all on public.invoice_number_counters from anon, authenticated;
-- Deliberately no policies and no grants: only issue_invoice() (SECURITY
-- DEFINER) ever touches this table.
