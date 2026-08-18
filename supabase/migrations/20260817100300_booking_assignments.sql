-- booking_assignments: candidate/offer records for the interpreter matching
-- workflow. bookings.interpreter_id remains the single source of truth for
-- who is actually, finally confirmed - this table is everything upstream of
-- that: who was invited or self-selected into an open assignment, who
-- responded how, and what was offered.
--
-- Every row here is created by an admin action (a direct invitation, or a
-- batch created when admin publishes an open assignment to the interpreters
-- who are currently eligible). Interpreters never create a row themselves;
-- they only ever transition their own existing row's status. That keeps
-- "who can see this assignment" a plain ownership check (does a row exist
-- for me?) rather than something RLS has to compute matching logic for.
create table public.booking_assignments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  interpreter_id uuid not null references public.interpreters (id) on delete cascade,

  assignment_type text not null check (assignment_type in ('open', 'direct')),
  status text not null default 'invited' check (status in (
    'invited', 'viewed', 'interested', 'declined', 'selected', 'rejected', 'withdrawn', 'expired'
  )),

  offered_compensation_ex_vat numeric(10, 2) not null check (offered_compensation_ex_vat >= 0),
  offered_travel_compensation_ex_vat numeric(10, 2) check (offered_travel_compensation_ex_vat is null or offered_travel_compensation_ex_vat >= 0),

  message_to_interpreter text,
  admin_notes text,

  invited_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One offer per interpreter per booking - re-inviting reuses/updates the
  -- existing row rather than creating a duplicate.
  unique (booking_id, interpreter_id)
);

comment on table public.booking_assignments is
  'Candidate/offer records for the interpreter matching workflow: who was invited or self-selected, their response, and what was offered. bookings.interpreter_id is the final confirmed interpreter and is set separately once one candidate is selected.';
comment on column public.booking_assignments.admin_notes is
  'Admin-only. Never exposed through any interpreter-facing view.';
comment on column public.booking_assignments.offered_compensation_ex_vat is
  'What this specific interpreter was offered for this booking. Never exposed to any other interpreter, and never joined with the customer''s price - there is no relationship in either portal-facing view that would let one be derived from the other.';

create trigger set_booking_assignments_updated_at
  before update on public.booking_assignments
  for each row
  execute function public.set_updated_at();

create index booking_assignments_booking_id_idx on public.booking_assignments (booking_id);
create index booking_assignments_interpreter_id_status_idx on public.booking_assignments (interpreter_id, status);

alter table public.booking_assignments enable row level security;

-- No insert/update grant for authenticated at all: every interpreter-side
-- state change (marking viewed, expressing interest, declining) goes
-- through the narrow RPCs in a later migration instead, each of which
-- validates the specific transition before touching anything. Admin writes
-- go through the ordinary is_admin() policy below like every other table.
revoke all on public.booking_assignments from anon, authenticated;
grant select, insert, update on public.booking_assignments to authenticated;

create policy "Admins manage booking assignments"
  on public.booking_assignments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Interpreters can read their own assignment offers"
  on public.booking_assignments
  for select
  to authenticated
  using (interpreter_id = public.current_interpreter_id());
