-- Booking events: append-only audit trail for bookings.

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  event_type text not null check (event_type in (
    'booking_created',
    'status_changed',
    'interpreter_assigned',
    'interpreter_removed',
    'customer_price_changed',
    'interpreter_cost_changed',
    'financials_updated',
    'booking_completed',
    'note_added'
  )),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.booking_events is
  'Append-only audit trail for bookings. created_by is NULL for system-generated events (e.g. the public website submission).';

-- Serves both "all events for a booking" and "...ordered by time", which
-- covers every query pattern the admin UI needs from a single index.
create index booking_events_booking_id_created_at_idx on public.booking_events (booking_id, created_at desc);

alter table public.booking_events enable row level security;

revoke all on public.booking_events from anon, authenticated;
-- No update/delete grant: this is an append-only log, by design.
grant select, insert on public.booking_events to authenticated;

create policy "Admins manage booking events"
  on public.booking_events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
