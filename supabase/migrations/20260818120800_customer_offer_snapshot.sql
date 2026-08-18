-- Immutable snapshot of the customer-facing commercial terms at the exact
-- moment a customer accepts an "Opdrachtvoorstel" - a booking-level
-- counterpart to invoices.seller_snapshot/customer_snapshot
-- (20260818100200_invoices.sql), which follows exactly the same principle:
-- write once, atomically, at the moment that matters; never let a later
-- operational edit rewrite what was actually agreed to.
--
-- bookings.customer_price_ex_vat and the other live commercial columns
-- stay fully admin-editable after acceptance, same as before this
-- migration - only this new snapshot column is ever protected. That is
-- deliberate: admin must still be able to operationally correct or adjust
-- a booking later, but the system must retain independent evidence of
-- what the customer actually agreed to, even if those live columns later
-- change.
alter table public.bookings
  add column customer_offer_snapshot jsonb;

comment on column public.bookings.customer_offer_snapshot is
  'Immutable snapshot of the customer-facing commercial terms at the moment of acceptance (customer_accept_booking_offer()): price/travel/overtime/vat, schedule, modality, language pair, sworn requirement, terms_version, the cancellation terms reference in effect, and who/when accepted. Never null -> non-null more than once, and never overwritten - see enforce_customer_offer_snapshot_immutability(). Editing the live *_ex_vat columns afterwards never touches this.';

-- Enforced for every role, including admin: unlike ordinary operational
-- fields, this snapshot is historical evidence, not a working value, so
-- there is no legitimate direct-edit path once it exists. A genuine
-- correction is a business decision that belongs in a new, separately
-- reasoned migration or manual intervention - never a silent application
-- write.
create or replace function public.enforce_customer_offer_snapshot_immutability()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.customer_offer_snapshot is not null
     and new.customer_offer_snapshot is distinct from old.customer_offer_snapshot
  then
    raise exception 'customer_offer_snapshot_is_immutable' using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function public.enforce_customer_offer_snapshot_immutability() is
  'BEFORE UPDATE guard on bookings: once customer_offer_snapshot is set, rejects any further change to it, for every role including admin. All other booking columns remain freely editable.';

create trigger enforce_customer_offer_snapshot_immutability_trigger
  before update on public.bookings
  for each row
  execute function public.enforce_customer_offer_snapshot_immutability();

-- Replaces customer_accept_booking_offer() to also build and store the
-- snapshot, and adds p_cancellation_terms_reference: the short legal
-- reference for the cancellation terms applicable at acceptance time. Its
-- text lives in the application (lib/legal/terms.ts), not here, matching
-- how the full Algemene Voorwaarden text already lives in
-- lib/site-content.ts rather than in SQL - a future change to that
-- wording is an app deploy, not a migration, exactly like p_terms_version
-- already works.
--
-- CREATE OR REPLACE cannot be used here: adding a new parameter changes
-- the function's argument-type signature, and Postgres treats a different
-- signature as a distinct, additional overload rather than a replacement
-- of the original - the same reasoning already documented in
-- 20260817110000_website_booking_request_optional_args.sql for the exact
-- same DROP + CREATE technique. Leaving the old 4-argument version in
-- place alongside a new 5-argument one would mean a caller could still
-- invoke the old one and skip the snapshot entirely, which defeats the
-- point of this migration.
drop function public.customer_accept_booking_offer(uuid, text, boolean, boolean);

create function public.customer_accept_booking_offer(
  p_booking_id uuid,
  p_terms_version text,
  p_early_performance_consent boolean default false,
  p_early_performance_full_completion_ack boolean default false,
  p_cancellation_terms_reference text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking record;
  v_customer_type text;
  v_consent_required boolean;
  v_snapshot jsonb;
  v_accepted_at timestamptz := now();
  v_accepted_by uuid := auth.uid();
begin
  select
    b.id, b.status, b.customer_id, b.customer_offer_snapshot,
    b.requested_date, b.requested_start_time, b.expected_duration_minutes,
    b.modality, b.language_from, b.language_to, b.sworn_required,
    b.customer_price_ex_vat, b.customer_travel_fee_ex_vat, b.customer_overtime_rate_ex_vat, b.vat_rate
  into v_booking
  from public.bookings b
  where b.id = p_booking_id
  for update;

  if v_booking.id is null or v_booking.customer_id not in (select public.current_customer_ids()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_booking.status <> 'quoted' then
    raise exception 'booking_not_awaiting_acceptance' using errcode = '55000';
  end if;

  -- Belt-and-suspenders alongside enforce_customer_offer_snapshot_immutability():
  -- a booking can only reach 'quoted' with a snapshot already set if admin
  -- manually moved an already-accepted booking's status back, which is not
  -- a normal flow. Fail with a clear, specific error here rather than
  -- relying on the trigger to reject the UPDATE below with a less
  -- friendly message.
  if v_booking.customer_offer_snapshot is not null then
    raise exception 'offer_already_accepted' using errcode = '55000';
  end if;

  if p_terms_version is null or btrim(p_terms_version) = '' then
    raise exception 'terms_version_required' using errcode = '22023';
  end if;

  select type into v_customer_type from public.customers where id = v_booking.customer_id;

  -- Required exactly when the Algemene Voorwaarden (article 18) says it
  -- matters: a consumer whose service may start within the statutory
  -- 14-day withdrawal period counted from today (the moment the contract
  -- is formed by this very acceptance).
  v_consent_required := v_customer_type = 'individual'
    and v_booking.requested_date is not null
    and v_booking.requested_date <= (current_date + interval '14 days');

  if v_consent_required and not coalesce(p_early_performance_consent, false) then
    raise exception 'early_performance_consent_required' using errcode = '55000';
  end if;

  v_snapshot := jsonb_build_object(
    'customer_price_ex_vat', v_booking.customer_price_ex_vat,
    'customer_travel_fee_ex_vat', v_booking.customer_travel_fee_ex_vat,
    'customer_overtime_rate_ex_vat', v_booking.customer_overtime_rate_ex_vat,
    'vat_rate', v_booking.vat_rate,
    'expected_duration_minutes', v_booking.expected_duration_minutes,
    'requested_date', v_booking.requested_date,
    'requested_start_time', v_booking.requested_start_time,
    'modality', v_booking.modality,
    'language_from', v_booking.language_from,
    'language_to', v_booking.language_to,
    'sworn_required', v_booking.sworn_required,
    'cancellation_terms_reference', nullif(btrim(coalesce(p_cancellation_terms_reference, '')), ''),
    'terms_version', btrim(p_terms_version),
    'accepted_at', v_accepted_at,
    'accepted_by_user_id', v_accepted_by
  );

  update public.bookings
  set
    status = 'customer_accepted',
    customer_accepted_at = v_accepted_at,
    customer_accepted_by_user_id = v_accepted_by,
    terms_version = btrim(p_terms_version),
    terms_accepted_at = v_accepted_at,
    terms_accepted_by_user_id = v_accepted_by,
    early_performance_consent_at = case when v_consent_required and p_early_performance_consent then v_accepted_at else early_performance_consent_at end,
    early_performance_consent_by_user_id = case when v_consent_required and p_early_performance_consent then v_accepted_by else early_performance_consent_by_user_id end,
    early_performance_full_completion_ack_at = case when v_consent_required and p_early_performance_full_completion_ack then v_accepted_at else early_performance_full_completion_ack_at end,
    customer_offer_snapshot = v_snapshot
  where id = p_booking_id;

  -- status_changed is already logged by the existing log_booking_changes
  -- trigger. The three events below are Phase-4-specific facts that
  -- trigger does not know about. The snapshot itself is embedded in
  -- customer_accepted's metadata so the audit trail carries a
  -- self-contained record of what was agreed, not just a pointer to a
  -- column that (by design) can never change anyway.
  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    p_booking_id, 'customer_accepted', 'Klant is akkoord gegaan met het opdrachtvoorstel.',
    jsonb_build_object('offer_snapshot', v_snapshot),
    v_accepted_by
  );

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    p_booking_id, 'terms_accepted',
    'Algemene voorwaarden geaccepteerd bij akkoord op de opdracht.',
    jsonb_build_object('terms_version', btrim(p_terms_version)),
    v_accepted_by
  );

  if v_consent_required and p_early_performance_consent then
    insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
    values (
      p_booking_id, 'consumer_early_performance_consent',
      'Consument heeft ingestemd met start van de dienstverlening binnen de bedenktijd.',
      jsonb_build_object(
        'terms_version', btrim(p_terms_version),
        'full_completion_ack', coalesce(p_early_performance_full_completion_ack, false)
      ),
      v_accepted_by
    );
  end if;
end;
$$;

comment on function public.customer_accept_booking_offer(uuid, text, boolean, boolean, text) is
  'Customer-only. Accepts a prepared Opdrachtvoorstel (status must be ''quoted''): moves the booking to customer_accepted, stamps terms acceptance, permanently snapshots the accepted commercial terms into customer_offer_snapshot (see enforce_customer_offer_snapshot_immutability()), and - only for a consumer whose service may start within the 14-day withdrawal period - requires and stamps explicit early-performance consent per article 18 of the Algemene Voorwaarden. Raises offer_already_accepted if a snapshot already exists, and early_performance_consent_required if that consent is legally required but not given.';

revoke all on function public.customer_accept_booking_offer(uuid, text, boolean, boolean, text) from public;
grant execute on function public.customer_accept_booking_offer(uuid, text, boolean, boolean, text) to authenticated;
