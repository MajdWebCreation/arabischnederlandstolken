-- Automatic audit logging for admin-driven booking changes.
--
-- Rather than relying on every Server Action to remember to call "update
-- the booking" and then separately "log an event" (two calls that could
-- fall out of sync if the second one is forgotten or fails), this trigger
-- detects the meaningful changes itself and logs them in the same
-- transaction as the UPDATE. That makes the audit trail correct by
-- construction, no matter which code path changes a booking.
--
-- booking_created is not handled here - it is logged explicitly by
-- submit_website_booking_request() at INSERT time, since "created" isn't a
-- change this AFTER UPDATE trigger ever sees.
create or replace function public.log_booking_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    insert into public.booking_events (booking_id, event_type, metadata, created_by)
    values (
      new.id,
      'status_changed',
      jsonb_build_object('from', old.status, 'to', new.status),
      auth.uid()
    );
  end if;

  if new.interpreter_id is distinct from old.interpreter_id then
    if new.interpreter_id is not null then
      insert into public.booking_events (booking_id, event_type, metadata, created_by)
      select
        new.id,
        'interpreter_assigned',
        jsonb_build_object(
          'interpreter_id', new.interpreter_id,
          'interpreter_name', (select i.first_name || ' ' || i.last_name from public.interpreters i where i.id = new.interpreter_id),
          'previous_interpreter_id', old.interpreter_id
        ),
        auth.uid();
    else
      insert into public.booking_events (booking_id, event_type, metadata, created_by)
      select
        new.id,
        'interpreter_removed',
        jsonb_build_object(
          'previous_interpreter_id', old.interpreter_id,
          'previous_interpreter_name', (select i.first_name || ' ' || i.last_name from public.interpreters i where i.id = old.interpreter_id)
        ),
        auth.uid();
    end if;
  end if;

  if new.customer_price_ex_vat is distinct from old.customer_price_ex_vat
     or new.interpreter_cost_ex_vat is distinct from old.interpreter_cost_ex_vat
     or new.customer_travel_fee_ex_vat is distinct from old.customer_travel_fee_ex_vat
     or new.interpreter_travel_cost_ex_vat is distinct from old.interpreter_travel_cost_ex_vat
     or new.customer_overtime_rate_ex_vat is distinct from old.customer_overtime_rate_ex_vat
     or new.interpreter_overtime_rate_ex_vat is distinct from old.interpreter_overtime_rate_ex_vat
     or new.vat_rate is distinct from old.vat_rate
  then
    insert into public.booking_events (booking_id, event_type, metadata, created_by)
    values (
      new.id,
      'financials_updated',
      jsonb_build_object(
        'before', jsonb_build_object(
          'customer_price_ex_vat', old.customer_price_ex_vat,
          'interpreter_cost_ex_vat', old.interpreter_cost_ex_vat,
          'customer_travel_fee_ex_vat', old.customer_travel_fee_ex_vat,
          'interpreter_travel_cost_ex_vat', old.interpreter_travel_cost_ex_vat,
          'customer_overtime_rate_ex_vat', old.customer_overtime_rate_ex_vat,
          'interpreter_overtime_rate_ex_vat', old.interpreter_overtime_rate_ex_vat,
          'vat_rate', old.vat_rate
        ),
        'after', jsonb_build_object(
          'customer_price_ex_vat', new.customer_price_ex_vat,
          'interpreter_cost_ex_vat', new.interpreter_cost_ex_vat,
          'customer_travel_fee_ex_vat', new.customer_travel_fee_ex_vat,
          'interpreter_travel_cost_ex_vat', new.interpreter_travel_cost_ex_vat,
          'customer_overtime_rate_ex_vat', new.customer_overtime_rate_ex_vat,
          'interpreter_overtime_rate_ex_vat', new.interpreter_overtime_rate_ex_vat,
          'vat_rate', new.vat_rate
        )
      ),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

comment on function public.log_booking_changes() is
  'AFTER UPDATE trigger on bookings. Detects status/interpreter/financial changes and logs a booking_events row atomically, in the same transaction as the update.';

create trigger log_booking_changes_after_update
  after update on public.bookings
  for each row
  execute function public.log_booking_changes();
