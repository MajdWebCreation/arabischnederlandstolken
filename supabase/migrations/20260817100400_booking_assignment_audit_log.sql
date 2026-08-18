-- Automatic audit logging for booking_assignments, mirroring the Phase 1
-- log_booking_changes() pattern: a trigger detects the meaningful change and
-- logs it in the same transaction, so the audit trail can't fall out of
-- sync with whichever code path (RPC or admin action) made the change.
--
-- The one deliberate exception: publishing an open assignment creates many
-- rows in a single statement (one per eligible interpreter), and this
-- per-row trigger intentionally does not log an event for those inserts -
-- logging N near-identical "invited" events for one publish action would be
-- noise, not history. The admin action that performs that bulk insert logs
-- one consolidated open_assignment_published event itself instead. Direct
-- invitations are the opposite case: each one is individually meaningful
-- ("I invited this specific person"), so those are logged per row here.
create or replace function public.log_booking_assignment_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_name text;
  v_event_type text;
begin
  select i.first_name || ' ' || i.last_name into v_interpreter_name
  from public.interpreters i
  where i.id = new.interpreter_id;

  if TG_OP = 'INSERT' then
    if new.assignment_type = 'direct' then
      insert into public.booking_events (booking_id, event_type, metadata, created_by)
      values (
        new.booking_id,
        'interpreter_invited',
        jsonb_build_object(
          'assignment_id', new.id,
          'interpreter_id', new.interpreter_id,
          'interpreter_name', v_interpreter_name,
          'offered_compensation_ex_vat', new.offered_compensation_ex_vat,
          'offered_travel_compensation_ex_vat', new.offered_travel_compensation_ex_vat
        ),
        auth.uid()
      );
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    v_event_type := case new.status
      when 'interested' then 'interpreter_interested'
      when 'declined' then 'interpreter_declined'
      when 'selected' then 'interpreter_selected'
      when 'withdrawn' then 'invitation_withdrawn'
      when 'rejected' then 'assignment_closed'
      else null
    end;

    if v_event_type is not null then
      insert into public.booking_events (booking_id, event_type, metadata, created_by)
      values (
        new.booking_id,
        v_event_type,
        jsonb_build_object(
          'assignment_id', new.id,
          'interpreter_id', new.interpreter_id,
          'interpreter_name', v_interpreter_name,
          'assignment_type', new.assignment_type,
          'from_status', old.status,
          'to_status', new.status
        ),
        auth.uid()
      );
    end if;
  end if;

  return new;
end;
$$;

comment on function public.log_booking_assignment_changes() is
  'AFTER INSERT OR UPDATE trigger on booking_assignments. Logs interpreter_invited for direct invitations, and status-transition events (interested/declined/selected/withdrawn/closed) atomically in the same transaction as the change. Open-assignment batch inserts are deliberately not logged per-row here - see comment above.';

create trigger log_booking_assignment_changes_trigger
  after insert or update on public.booking_assignments
  for each row
  execute function public.log_booking_assignment_changes();
