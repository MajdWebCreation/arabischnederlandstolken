-- Atomic final selection: everything the brief asks for as one transaction,
-- so there is never a moment where an assignment says "selected" but
-- bookings.interpreter_id still points elsewhere (or nowhere).
--
-- SECURITY INVOKER on purpose: an admin calling this already has every
-- underlying grant needed (booking_assignments and bookings are both
-- is_admin()-gated for full access), so there is no need to elevate
-- privileges here. The explicit is_admin() check still guards the entry
-- point directly, matching the defensive style used throughout this
-- project rather than relying on RLS alone to fail a non-admin caller
-- silently mid-function.
--
-- Event logging for the interpreter_selected / assignment_closed /
-- interpreter_assigned / status_changed / financials_updated events all
-- happens automatically via the existing triggers on booking_assignments
-- and bookings - this function only needs to perform the updates.
create or replace function public.select_interpreter_for_booking(
  p_booking_id uuid,
  p_assignment_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_assignment record;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select * into v_assignment
  from public.booking_assignments
  where id = p_assignment_id and booking_id = p_booking_id
  for update;

  if v_assignment.id is null then
    raise exception 'assignment_not_found' using errcode = 'P0002';
  end if;

  if v_assignment.status not in ('invited', 'viewed', 'interested') then
    raise exception 'assignment_not_selectable' using errcode = '55000';
  end if;

  -- Close every other still-open candidate first, so there's never a
  -- window where two rows for the same booking both look live.
  update public.booking_assignments
  set status = 'rejected'
  where booking_id = p_booking_id
    and id <> p_assignment_id
    and status in ('invited', 'viewed', 'interested');

  update public.booking_assignments
  set status = 'selected', responded_at = coalesce(responded_at, now())
  where id = p_assignment_id;

  update public.bookings
  set
    interpreter_id = v_assignment.interpreter_id,
    status = 'interpreter_confirmed',
    interpreter_cost_ex_vat = v_assignment.offered_compensation_ex_vat,
    interpreter_travel_cost_ex_vat = v_assignment.offered_travel_compensation_ex_vat
  where id = p_booking_id;
end;
$$;

comment on function public.select_interpreter_for_booking(uuid, uuid) is
  'Admin-only. Atomically selects one candidate: closes competing offers, marks the chosen one selected, sets bookings.interpreter_id and status, and copies the agreed compensation into the booking''s financial fields. All resulting audit events are logged by existing triggers.';

revoke all on function public.select_interpreter_for_booking(uuid, uuid) from public;
grant execute on function public.select_interpreter_for_booking(uuid, uuid) to authenticated;
