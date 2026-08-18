-- New booking fields needed by the assignment workflow, plus the expanded
-- audit event vocabulary Phase 2 introduces.
alter table public.bookings
  add column is_open_assignment boolean not null default false,
  add column open_assignment_published_at timestamptz,
  -- Admin-authored, shown to candidate interpreters pre-selection as the
  -- short job description, and remains visible post-selection as their
  -- instructions - one field serves both moments deliberately, rather than
  -- keeping two near-duplicate fields in sync.
  add column interpreter_brief text,
  add column required_dialect_tag_id uuid references public.capability_tags (id) on delete set null,
  -- Who/what number the interpreter should ask for on arrival - distinct
  -- from the customer's own identity and contact details, which stay
  -- hidden from interpreters entirely (see the portal-facing views).
  add column onsite_contact_name text,
  add column onsite_contact_phone text;

comment on column public.bookings.is_open_assignment is
  'True once this booking has been published for interpreter self-selection at least once. One-way: stays true even after a candidate is chosen, as a historical fact about how the booking was staffed.';
comment on column public.bookings.interpreter_brief is
  'Admin-authored description/instructions shown to candidate and selected interpreters. Deliberately separate from customer_message, which stays admin-only - the customer''s own words may contain sensitive detail an interpreter does not need before accepting a job.';
comment on column public.bookings.required_dialect_tag_id is
  'Optional: a specific dialect capability_tags row this booking asks for. Informational for matching, not a hard eligibility gate.';

create index bookings_is_open_assignment_idx on public.bookings (is_open_assignment) where is_open_assignment;

-- Postgres has no "add a CHECK value" operation - the existing constraint is
-- dropped and recreated with the expanded list. interpreter_removed is
-- intentionally NOT duplicated here: it already exists from Phase 1 and
-- keeps its existing meaning (a booking's confirmed interpreter_id was
-- cleared), which the Phase 2 selection RPC reuses as-is rather than
-- inventing a second, overlapping event type.
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
  'assignment_closed'
));
