-- New booking fields needed by the customer portal (acceptance, terms
-- versioning, consumer early-performance consent, repeat-booking lineage),
-- plus the expanded source and audit-event vocabularies Phase 4 introduces.
--
-- Deliberately no new booking.status values: the brief is explicit that
-- the existing statuses ('new' -> 'interpreter_search' -> 'quoted' ->
-- 'customer_accepted' -> 'interpreter_confirmed' -> 'confirmed' ->
-- 'completed' / 'cancelled', all already present since Phase 1) already
-- cover the customer-facing lifecycle end to end - 'quoted' is exactly the
-- moment an admin has prepared customer-facing terms (price, duration,
-- modality - all already booking columns) and the customer portal shows
-- "Opdrachtvoorstel"; accepting it moves the booking to
-- 'customer_accepted'. Customer-facing labels are a presentation-layer
-- mapping over these same statuses (see lib/customers/portal-status.ts),
-- never a second lifecycle.
alter table public.bookings
  add column customer_accepted_at timestamptz,
  add column customer_accepted_by_user_id uuid references auth.users (id) on delete set null,
  add column terms_version text,
  add column terms_accepted_at timestamptz,
  add column terms_accepted_by_user_id uuid references auth.users (id) on delete set null,
  -- Consumer-only (see article 18 of the Algemene Voorwaarden, version
  -- 2026-08): explicit consent to start the service within the statutory
  -- 14-day withdrawal period, captured separately from ordinary terms
  -- acceptance, and the separate acknowledgement that full performance
  -- within that period extinguishes the withdrawal right.
  add column early_performance_consent_at timestamptz,
  add column early_performance_consent_by_user_id uuid references auth.users (id) on delete set null,
  add column early_performance_full_completion_ack_at timestamptz,
  -- Set only when this booking was created via "Opnieuw boeken" from an
  -- earlier one. Purely informational lineage for the admin/customer UI -
  -- never copies status, price, notes, or the previous interpreter (see
  -- customer_submit_booking_request(), which is the only place this column
  -- is ever set). ON DELETE SET NULL: losing the lineage pointer must never
  -- block deleting/archiving an old booking in the future.
  add column repeated_from_booking_id uuid references public.bookings (id) on delete set null,
  -- Pending-request withdrawal (Phase 4 brief section 24: "Aanvraag
  -- intrekken"), distinct from both the admin-reviewed cancellation_requests
  -- workflow (confirmed bookings) and the statutory consumer withdrawal
  -- right (captured as a cancellation_requests row with
  -- request_type='consumer_withdrawal' - see 20260818120600_cancellation_requests.sql).
  -- This one is a same-transaction, no-review-needed close of a request
  -- that never became a binding assignment.
  add column request_withdrawn_at timestamptz,
  add column request_withdrawn_by_user_id uuid references auth.users (id) on delete set null,
  add column request_withdrawal_reason text;

comment on column public.bookings.customer_accepted_at is 'Stamped by customer_accept_booking_offer() when the customer clicks "Akkoord" on a prepared Opdrachtvoorstel.';
comment on column public.bookings.terms_version is 'The Algemene Voorwaarden version string (e.g. "2026-08") in effect at the moment the customer accepted this specific booking.';
comment on column public.bookings.repeated_from_booking_id is 'Set only for a booking created via "Opnieuw boeken". Lineage only - never implies any binding relationship to the earlier booking''s price, status, or interpreter.';

create index bookings_repeated_from_booking_id_idx on public.bookings (repeated_from_booking_id) where repeated_from_booking_id is not null;

-- Postgres has no "add a CHECK value" operation - drop and recreate with
-- the one new source a customer-portal-created booking uses.
alter table public.bookings drop constraint bookings_source_check;
alter table public.bookings add constraint bookings_source_check check (source in (
  'website', 'phone', 'email', 'referral', 'admin', 'other', 'customer_portal'
));

alter table public.booking_events drop constraint booking_events_event_type_check;
alter table public.booking_events add constraint booking_events_event_type_check check (event_type in (
  'booking_created',
  'status_changed',
  'interpreter_assigned',
  'interpreter_removed',
  'customer_price_changed',
  'interpreter_cost_changed',
  'financials_updated',
  'booking_completed',
  'note_added',
  'open_assignment_published',
  'interpreter_invited',
  'interpreter_interested',
  'interpreter_declined',
  'interpreter_selected',
  'invitation_withdrawn',
  'assignment_closed',
  -- Phase 4: customer portal, repeat bookings, acceptance, cancellation.
  'customer_request_created',
  'customer_offer_sent',
  'customer_accepted',
  'customer_change_requested',
  'terms_accepted',
  'consumer_early_performance_consent',
  'customer_withdrawn_request',
  'cancellation_requested',
  'cancellation_approved',
  'cancellation_rejected',
  'interpreter_unavailability_reported',
  'replacement_search_started',
  'replacement_interpreter_selected',
  'customer_confirmation_sent'
));
