-- Append-only audit trail for interpreter settlements, mirroring
-- invoice_events (20260818100400_invoice_events.sql) exactly. Admin-only -
-- like invoice_events (not customer-visible), the interpreter never reads
-- this table directly; they see their settlement's current status and
-- last_change_request_message instead (see my_interpreter_invoices).
create table public.interpreter_invoice_events (
  id uuid primary key default gen_random_uuid(),
  interpreter_invoice_id uuid not null references public.interpreter_invoices (id) on delete cascade,
  event_type text not null check (event_type in (
    'settlement_created',
    'submitted_for_review',
    'interpreter_approved',
    'change_requested',
    'issued',
    'marked_paid',
    'cancelled'
  )),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.interpreter_invoice_events is
  'Append-only audit trail for interpreter self-billing settlements. Admin-only, mirroring invoice_events. created_by is NULL only if the acting user''s auth row no longer exists (or the action was system-triggered, e.g. a database default).';

create index interpreter_invoice_events_invoice_id_created_at_idx
  on public.interpreter_invoice_events (interpreter_invoice_id, created_at desc);

alter table public.interpreter_invoice_events enable row level security;

revoke all on public.interpreter_invoice_events from anon, authenticated;
-- No update/delete grant: append-only, same as invoice_events.
grant select, insert on public.interpreter_invoice_events to authenticated;

create policy "Admins manage interpreter invoice events"
  on public.interpreter_invoice_events
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Automatic logging, mirroring log_invoice_changes()'s pattern exactly - the
-- application/RPCs never insert an interpreter_invoice_events row
-- themselves; they just make the underlying interpreter_invoices change,
-- and this trigger records what happened. auth.uid() is used directly
-- (rather than trusting a parameter) so the actor is always the real caller,
-- whether that's an admin's plain UPDATE or an interpreter's SECURITY
-- DEFINER RPC call (auth.uid() still resolves to the real caller inside a
-- SECURITY DEFINER function - see the interpreter self-billing precedent in
-- 20260818121200_interpreter_onboarding_fields.sql).
create or replace function public.log_interpreter_invoice_changes()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, created_by)
    values (new.id, 'settlement_created', 'Afrekening aangemaakt.', auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status and new.status = 'pending_review' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, created_by)
    values (
      new.id, 'submitted_for_review',
      case when old.status = 'change_requested'
        then 'Aangepaste afrekening opnieuw naar de tolk gestuurd.'
        else 'Afrekening naar de tolk gestuurd ter controle.'
      end,
      auth.uid()
    );
  end if;

  if new.status is distinct from old.status and new.status = 'approved' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, metadata, created_by)
    values (
      new.id, 'interpreter_approved', 'Tolk is akkoord gegaan met de afrekening.',
      jsonb_build_object('self_billing_terms_version', new.self_billing_terms_version),
      auth.uid()
    );
  end if;

  if new.status is distinct from old.status and new.status = 'change_requested' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, metadata, created_by)
    values (
      new.id, 'change_requested', 'Tolk heeft een wijziging aangevraagd.',
      jsonb_build_object('message', new.last_change_request_message),
      auth.uid()
    );
  end if;

  if new.status is distinct from old.status and new.status = 'issued' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, metadata, created_by)
    values (
      new.id, 'issued', 'Officiële self-billing factuur uitgegeven: ' || coalesce(new.invoice_number, '-'),
      jsonb_build_object('invoice_number', new.invoice_number),
      auth.uid()
    );
  end if;

  if new.paid_at is distinct from old.paid_at and new.paid_at is not null then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, created_by)
    values (new.id, 'marked_paid', 'Gemarkeerd als betaald.', auth.uid());
  end if;

  if new.status is distinct from old.status and new.status = 'cancelled' then
    insert into public.interpreter_invoice_events (interpreter_invoice_id, event_type, description, created_by)
    values (new.id, 'cancelled', 'Afrekening geannuleerd.', auth.uid());
  end if;

  return new;
end;
$$;

comment on function public.log_interpreter_invoice_changes() is
  'Auto-logs interpreter_invoice_events on every interpreter_invoices insert/update - see log_invoice_changes() for the identical pattern on customer invoices.';

create trigger log_interpreter_invoice_changes_trigger
  after insert or update on public.interpreter_invoices
  for each row
  execute function public.log_interpreter_invoice_changes();
