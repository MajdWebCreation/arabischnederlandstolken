-- Interpreter-reported unavailability on a confirmed assignment (Phase 4
-- brief sections 27-28: "Ik ben verhinderd"). Deliberately does not touch
-- bookings.interpreter_id or bookings.status at all - reporting
-- unavailability only flags the assignment as requiring attention and
-- notifies admin; the customer's booking is preserved exactly as-is until
-- admin finds and assigns a replacement through the existing assignment
-- workflow (BookingInterpreterForm / booking_assignments), which already
-- logs interpreter_removed/interpreter_assigned via log_booking_changes()
-- the moment interpreter_id actually changes. This table's only job is the
-- "something needs admin attention" signal and its own audit trail.
create table public.interpreter_unavailability_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  interpreter_id uuid not null references public.interpreters (id) on delete cascade,

  reported_at timestamptz not null default now(),
  reason text,

  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_at timestamptz,
  resolved_by_user_id uuid references auth.users (id) on delete set null,
  resolution_note text,
  -- Set by admin once a replacement is actually assigned, purely as a
  -- record of the outcome - bookings.interpreter_id is what actually
  -- governs who is assigned; this column never drives any workflow itself.
  replacement_interpreter_id uuid references public.interpreters (id) on delete set null,

  created_at timestamptz not null default now()
);

comment on table public.interpreter_unavailability_reports is
  'Interpreter-reported "I can no longer do this confirmed assignment". Flags the assignment for admin attention without touching the booking itself - the customer''s booking stays intact until admin resolves this (typically by assigning a replacement via the existing interpreter_id workflow).';

create index interpreter_unavailability_reports_booking_id_idx on public.interpreter_unavailability_reports (booking_id);
create index interpreter_unavailability_reports_open_idx on public.interpreter_unavailability_reports (status) where status = 'open';
-- One open report per booking at a time - a second "I can't do this
-- either" report only makes sense after the first has been resolved.
create unique index interpreter_unavailability_reports_one_open_per_booking on public.interpreter_unavailability_reports (booking_id) where status = 'open';

alter table public.interpreter_unavailability_reports enable row level security;

-- No direct insert/update grant for authenticated: the only interpreter
-- write path is the RPC below, and admin resolution happens through
-- ordinary UPDATE calls covered by the is_admin() policy (matching how
-- admin already resolves everything else in this project directly rather
-- than through single-purpose RPCs).
revoke all on public.interpreter_unavailability_reports from anon, authenticated;
grant select, update on public.interpreter_unavailability_reports to authenticated;

create policy "Admins manage interpreter unavailability reports"
  on public.interpreter_unavailability_reports
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Interpreters can read their own unavailability reports"
  on public.interpreter_unavailability_reports
  for select
  to authenticated
  using (interpreter_id = public.current_interpreter_id());

create or replace function public.interpreter_report_unavailable(
  p_booking_id uuid,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
  v_booking record;
  v_report_id uuid;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select id, status, interpreter_id into v_booking
  from public.bookings
  where id = p_booking_id;

  if v_booking.id is null or v_booking.interpreter_id is distinct from v_interpreter_id then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_booking.status not in ('interpreter_confirmed', 'confirmed') then
    raise exception 'booking_not_confirmed' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.interpreter_unavailability_reports
    where booking_id = p_booking_id and status = 'open'
  ) then
    raise exception 'already_reported' using errcode = '55000';
  end if;

  insert into public.interpreter_unavailability_reports (booking_id, interpreter_id, reason)
  values (p_booking_id, v_interpreter_id, nullif(btrim(p_reason), ''))
  returning id into v_report_id;

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    p_booking_id,
    'interpreter_unavailability_reported',
    'Tolk heeft gemeld verhinderd te zijn voor deze bevestigde opdracht.',
    jsonb_build_object('unavailability_report_id', v_report_id),
    auth.uid()
  );

  return v_report_id;
end;
$$;

comment on function public.interpreter_report_unavailable(uuid, text) is
  'Interpreter-only. Records that the caller can no longer perform their own confirmed booking (status must be interpreter_confirmed or confirmed) and flags it for admin attention. Never changes bookings.status or bookings.interpreter_id - the customer''s booking is preserved until admin arranges a replacement.';

revoke all on function public.interpreter_report_unavailable(uuid, text) from public;
grant execute on function public.interpreter_report_unavailable(uuid, text) to authenticated;
