-- Customer acceptance of a prepared booking offer ("Opdrachtvoorstel"),
-- and requesting a change instead. bookings has no update grant for
-- customers at all (only the is_admin() policy from Phase 1), so - exactly
-- like the interpreter response RPCs in
-- 20260817100500_interpreter_assignment_rpcs.sql - these SECURITY DEFINER
-- functions are the entire allowlist of what a customer can change on
-- their own booking, each validating the transition itself.
--
-- "quoted" is the existing status an admin sets once customer-facing terms
-- (customer_price_ex_vat, customer_travel_fee_ex_vat,
-- customer_overtime_rate_ex_vat, vat_rate, requested_date/start_time,
-- expected_duration_minutes, modality - all already ordinary booking
-- columns, editable via the existing admin financials/details forms) are
-- ready to show the customer. That is deliberately the only trigger this
-- function needs to check - no new "offer prepared" flag was added.
create or replace function public.customer_accept_booking_offer(
  p_booking_id uuid,
  p_terms_version text,
  p_early_performance_consent boolean default false,
  p_early_performance_full_completion_ack boolean default false
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
begin
  select b.id, b.status, b.customer_id, b.requested_date
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

  update public.bookings
  set
    status = 'customer_accepted',
    customer_accepted_at = now(),
    customer_accepted_by_user_id = auth.uid(),
    terms_version = btrim(p_terms_version),
    terms_accepted_at = now(),
    terms_accepted_by_user_id = auth.uid(),
    early_performance_consent_at = case when v_consent_required and p_early_performance_consent then now() else early_performance_consent_at end,
    early_performance_consent_by_user_id = case when v_consent_required and p_early_performance_consent then auth.uid() else early_performance_consent_by_user_id end,
    early_performance_full_completion_ack_at = case when v_consent_required and p_early_performance_full_completion_ack then now() else early_performance_full_completion_ack_at end
  where id = p_booking_id;

  -- status_changed is already logged by the existing log_booking_changes
  -- trigger. The three events below are Phase-4-specific facts that
  -- trigger does not know about.
  insert into public.booking_events (booking_id, event_type, description, created_by)
  values (p_booking_id, 'customer_accepted', 'Klant is akkoord gegaan met het opdrachtvoorstel.', auth.uid());

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    p_booking_id, 'terms_accepted',
    'Algemene voorwaarden geaccepteerd bij akkoord op de opdracht.',
    jsonb_build_object('terms_version', btrim(p_terms_version)),
    auth.uid()
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
      auth.uid()
    );
  end if;
end;
$$;

comment on function public.customer_accept_booking_offer(uuid, text, boolean, boolean) is
  'Customer-only. Accepts a prepared Opdrachtvoorstel (status must be ''quoted''): moves the booking to customer_accepted, stamps terms acceptance, and - only for a consumer whose service may start within the 14-day withdrawal period - requires and stamps explicit early-performance consent per article 18 of the Algemene Voorwaarden. Raises early_performance_consent_required if that consent is legally required but not given.';

-- "Wijziging aanvragen": logs the customer's request without changing
-- status - the booking stays ''quoted'' so admin can revise the prepared
-- terms and the customer portal shows the updated numbers immediately,
-- with no separate "resend" step needed.
create or replace function public.customer_request_booking_change(
  p_booking_id uuid,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking record;
begin
  select b.id, b.status, b.customer_id into v_booking
  from public.bookings b
  where b.id = p_booking_id;

  if v_booking.id is null or v_booking.customer_id not in (select public.current_customer_ids()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_booking.status <> 'quoted' then
    raise exception 'booking_not_awaiting_acceptance' using errcode = '55000';
  end if;

  if p_message is null or btrim(p_message) = '' then
    raise exception 'message_required' using errcode = '22023';
  end if;

  insert into public.booking_events (booking_id, event_type, description, created_by)
  values (p_booking_id, 'customer_change_requested', btrim(p_message), auth.uid());
end;
$$;

comment on function public.customer_request_booking_change(uuid, text) is
  'Customer-only. Logs a change request against a prepared Opdrachtvoorstel (status must be ''quoted'') for admin to review and revise. Never changes booking status itself.';

revoke all on function public.customer_accept_booking_offer(uuid, text, boolean, boolean) from public;
revoke all on function public.customer_request_booking_change(uuid, text) from public;
grant execute on function public.customer_accept_booking_offer(uuid, text, boolean, boolean) to authenticated;
grant execute on function public.customer_request_booking_change(uuid, text) to authenticated;
