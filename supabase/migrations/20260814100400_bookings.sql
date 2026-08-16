-- Bookings: the central entity of the application, plus a race-safe,
-- human-readable booking number generator.
--
-- Booking numbers look like ANT-2026-000001, ANT-2026-000002, ... The year
-- reflects the booking's creation date in Europe/Amsterdam local time (so a
-- booking made just after midnight on New Year's Eve gets the new year).
-- Generation always happens in a BEFORE INSERT trigger - never in the
-- browser and never as a client-supplied value - so it is safe under
-- concurrent booking requests: the counter update below is a single atomic
-- UPSERT, which Postgres serialises per row via its normal locking, so two
-- simultaneous inserts can never be handed the same number.

create table public.booking_number_counters (
  year integer primary key,
  last_value integer not null default 0
);

comment on table public.booking_number_counters is
  'One row per calendar year (Europe/Amsterdam). Tracks the last issued booking sequence number for that year. Only ever touched internally by set_booking_number().';

alter table public.booking_number_counters enable row level security;
revoke all on public.booking_number_counters from anon, authenticated;
-- Deliberately no policies and no grants: this table has no legitimate
-- direct caller. It is only ever written by set_booking_number(), which
-- runs as SECURITY DEFINER and so does not need table grants of its own.

create or replace function public.set_booking_number()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  booking_year integer;
  next_value integer;
begin
  if new.booking_number is not null then
    return new;
  end if;

  booking_year := extract(year from (now() at time zone 'Europe/Amsterdam'))::integer;

  insert into public.booking_number_counters (year, last_value)
  values (booking_year, 1)
  on conflict (year)
  do update set last_value = public.booking_number_counters.last_value + 1
  returning last_value into next_value;

  new.booking_number := 'ANT-' || booking_year::text || '-' || lpad(next_value::text, 6, '0');
  return new;
end;
$$;

comment on function public.set_booking_number() is
  'BEFORE INSERT trigger that assigns a unique, sequential, human-readable booking_number. Always server/database-generated, never client-supplied, and safe under concurrent inserts.';

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  interpreter_id uuid references public.interpreters (id) on delete set null,

  source text not null default 'website' check (source in ('website', 'phone', 'email', 'referral', 'admin', 'other')),
  request_type text not null check (request_type in ('regular', 'urgent', 'sworn', 'availability', 'other')),
  context text not null check (context in ('healthcare', 'municipality', 'legal', 'migration', 'business', 'other')),

  -- Short lowercase language codes by convention (e.g. 'ar', 'nl'), kept as
  -- free text so combinations beyond Arabic/Dutch need no schema change.
  language_from text not null check (btrim(language_from) <> ''),
  language_to text not null check (btrim(language_to) <> ''),
  language_notes text,

  -- Nullable: the public form allows "not sure yet", which is meaningfully
  -- different from any of the three concrete modalities.
  modality text check (modality in ('telephone', 'video', 'onsite')),

  requested_date date,
  requested_start_time time,
  expected_duration_minutes integer check (expected_duration_minutes is null or expected_duration_minutes > 0),
  actual_duration_minutes integer check (actual_duration_minutes is null or actual_duration_minutes > 0),

  location_name text,
  location_address text,

  -- The customer's own words, kept separate from admin-only internal_notes.
  customer_message text,
  internal_notes text,

  sworn_required boolean not null default false,

  status text not null default 'new' check (status in (
    'new',
    'interpreter_search',
    'quoted',
    'customer_accepted',
    'interpreter_confirmed',
    'confirmed',
    'completed',
    'cancelled',
    'customer_invoiced',
    'paid'
  )),

  -- Money is always NUMERIC(10,2), never floating point. All *_ex_vat
  -- fields are admin-only and must never be exposed to the public or to a
  -- future interpreter-facing view.
  customer_price_ex_vat numeric(10, 2) check (customer_price_ex_vat is null or customer_price_ex_vat >= 0),
  interpreter_cost_ex_vat numeric(10, 2) check (interpreter_cost_ex_vat is null or interpreter_cost_ex_vat >= 0),
  customer_travel_fee_ex_vat numeric(10, 2) check (customer_travel_fee_ex_vat is null or customer_travel_fee_ex_vat >= 0),
  interpreter_travel_cost_ex_vat numeric(10, 2) check (interpreter_travel_cost_ex_vat is null or interpreter_travel_cost_ex_vat >= 0),
  customer_overtime_rate_ex_vat numeric(10, 2) check (customer_overtime_rate_ex_vat is null or customer_overtime_rate_ex_vat >= 0),
  interpreter_overtime_rate_ex_vat numeric(10, 2) check (interpreter_overtime_rate_ex_vat is null or interpreter_overtime_rate_ex_vat >= 0),
  vat_rate numeric(5, 2) not null default 21.00 check (vat_rate >= 0 and vat_rate <= 100),

  form_language text check (form_language in ('nl', 'ar')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.bookings is
  'Central booking record: one interpreting assignment requested by a customer.';
comment on column public.bookings.internal_notes is
  'Admin-only. Distinct from customer_message (the customer''s own words). Never expose publicly.';
comment on column public.bookings.customer_price_ex_vat is 'Admin-only financial field. Never expose to the public.';
comment on column public.bookings.interpreter_cost_ex_vat is 'Admin-only financial field. Never expose to the customer or publicly.';

create trigger set_booking_number_before_insert
  before insert on public.bookings
  for each row
  execute function public.set_booking_number();

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

create index bookings_status_idx on public.bookings (status);
create index bookings_requested_date_idx on public.bookings (requested_date);
create index bookings_customer_id_idx on public.bookings (customer_id);
create index bookings_interpreter_id_idx on public.bookings (interpreter_id);
create index bookings_created_at_idx on public.bookings (created_at desc);
-- booking_number already has a unique index from the UNIQUE constraint
-- above; a second index on the same column would be redundant.

alter table public.bookings enable row level security;

revoke all on public.bookings from anon, authenticated;
-- No delete grant: bookings are financial/audit records and booking_events
-- cascades from booking_id, so deleting a booking would silently destroy
-- its audit trail. Nothing in Phase 1 needs to delete a booking.
grant select, insert, update on public.bookings to authenticated;

create policy "Admins manage bookings"
  on public.bookings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
