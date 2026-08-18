-- Append-only audit trail for invoices, mirroring booking_events
-- (20260814100500_booking_events.sql) exactly.
create table public.invoice_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  event_type text not null check (event_type in (
    'invoice_created',
    'invoice_issued',
    'invoice_sent',
    'invoice_marked_paid',
    'invoice_payment_reverted',
    'invoice_cancelled'
  )),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.invoice_events is
  'Append-only audit trail for invoices. created_by is NULL only if the acting user''s auth row no longer exists.';

create index invoice_events_invoice_id_created_at_idx on public.invoice_events (invoice_id, created_at desc);

alter table public.invoice_events enable row level security;

revoke all on public.invoice_events from anon, authenticated;
-- No update/delete grant: append-only, same as booking_events.
grant select, insert on public.invoice_events to authenticated;

create policy "Admins manage invoice events"
  on public.invoice_events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Automatic logging, mirroring log_booking_changes()'s pattern
-- (20260814100700_booking_change_log.sql): the application never inserts
-- an invoice_events row itself for any of these six lifecycle moments -
-- it just makes the underlying invoices change (INSERT the draft, or
-- UPDATE the relevant column(s)), and this trigger records what happened.
-- Keyed off which column actually changed rather than only the `status`
-- transition, so e.g. re-sending an already-'sent' invoice (sent_at
-- changes again, status does not) still logs a fresh invoice_sent event.
create or replace function public.log_invoice_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.invoice_events (invoice_id, event_type, description, created_by)
    values (new.id, 'invoice_created', 'Conceptfactuur aangemaakt.', auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status and new.status = 'issued' then
    insert into public.invoice_events (invoice_id, event_type, description, metadata, created_by)
    values (
      new.id, 'invoice_issued',
      'Factuur definitief gemaakt: ' || coalesce(new.invoice_number, '-'),
      jsonb_build_object('invoice_number', new.invoice_number),
      auth.uid()
    );
  end if;

  if new.sent_at is distinct from old.sent_at and new.sent_at is not null then
    insert into public.invoice_events (invoice_id, event_type, description, metadata, created_by)
    values (
      new.id, 'invoice_sent',
      'Factuur verzonden naar ' || coalesce(new.sent_to_email, '-'),
      jsonb_build_object('sent_to_email', new.sent_to_email),
      auth.uid()
    );
  end if;

  if new.paid_at is distinct from old.paid_at then
    if new.paid_at is not null then
      insert into public.invoice_events (invoice_id, event_type, description, created_by)
      values (new.id, 'invoice_marked_paid', 'Factuur gemarkeerd als betaald.', auth.uid());
    else
      insert into public.invoice_events (invoice_id, event_type, description, created_by)
      values (new.id, 'invoice_payment_reverted', 'Betaalmarkering ongedaan gemaakt.', auth.uid());
    end if;
  end if;

  if new.status is distinct from old.status and new.status = 'cancelled' then
    insert into public.invoice_events (invoice_id, event_type, description, created_by)
    values (new.id, 'invoice_cancelled', 'Factuur geannuleerd.', auth.uid());
  end if;

  return new;
end;
$$;

comment on function public.log_invoice_changes() is
  'Auto-logs invoice_events on every invoices insert/update - see log_booking_changes() for the identical pattern on bookings.';

create trigger log_invoice_changes_trigger
  after insert or update on public.invoices
  for each row
  execute function public.log_invoice_changes();
