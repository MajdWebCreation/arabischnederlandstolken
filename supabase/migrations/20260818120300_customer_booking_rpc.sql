-- The only write path available to authenticated customer-portal users for
-- creating a booking - covers both a fresh request (Phase 4 brief section
-- 7) and "Opnieuw boeken" (section 8), which is just this same function
-- called with p_repeated_from_booking_id set and the operational defaults
-- of the earlier booking passed back in as plain parameters by the caller.
--
-- bookings has no direct insert grant for authenticated at all (see Phase
-- 1) - this SECURITY DEFINER function is the entire allowlist, exactly
-- mirroring submit_website_booking_request()'s role for anonymous
-- visitors. The differences from that function: the caller must already be
-- an authorised member of the target customer (checked against
-- current_customer_ids(), never trusting a client-supplied customer_id
-- alone), source is hardcoded to 'customer_portal' rather than 'website',
-- and it accepts the richer scheduling fields (date/time/duration/
-- location) the authenticated form collects up front. Every internal/admin
-- field - status, interpreter_id, any *_ex_vat, internal_notes - is still
-- hardcoded/omitted here exactly as before; there is no way to smuggle one
-- through this parameter list.
create or replace function public.customer_submit_booking_request(
  p_customer_id uuid,
  p_language_from text,
  p_language_to text,
  p_context text,
  p_language_notes text default null,
  p_modality text default null,
  p_sworn_required boolean default false,
  p_requested_date date default null,
  p_requested_start_time time default null,
  p_expected_duration_minutes integer default null,
  p_location_name text default null,
  p_location_address text default null,
  p_customer_message text default null,
  p_repeated_from_booking_id uuid default null
)
returns table (booking_id uuid, booking_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_language_from text := nullif(btrim(p_language_from), '');
  v_language_to text := nullif(btrim(p_language_to), '');
  v_recent_submissions integer;
  v_repeated_from_customer_id uuid;
  v_booking_id uuid;
  v_booking_number text;
begin
  if p_customer_id is null or p_customer_id not in (select public.current_customer_ids()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_language_from is null or v_language_to is null then
    raise exception 'invalid_language_pair' using errcode = '22023';
  end if;

  if p_context not in ('healthcare', 'municipality', 'legal', 'migration', 'business', 'other') then
    raise exception 'invalid_context' using errcode = '22023';
  end if;

  if p_modality is not null and p_modality not in ('telephone', 'video', 'onsite') then
    raise exception 'invalid_modality' using errcode = '22023';
  end if;

  if p_repeated_from_booking_id is not null then
    select customer_id into v_repeated_from_customer_id
    from public.bookings
    where id = p_repeated_from_booking_id;

    if v_repeated_from_customer_id is distinct from p_customer_id then
      raise exception 'repeated_from_booking_not_yours' using errcode = '42501';
    end if;
  end if;

  -- Same generous anti-abuse guard as the public website form, keyed off
  -- the target customer rather than a freshly-matched one (an authenticated
  -- portal customer already exists by definition).
  select count(*) into v_recent_submissions
  from public.bookings
  where customer_id = p_customer_id
    and created_at > now() - interval '1 hour';

  if v_recent_submissions >= 10 then
    raise exception 'too_many_requests' using errcode = '55000';
  end if;

  insert into public.bookings (
    customer_id, source, request_type, context,
    language_from, language_to, language_notes, modality,
    requested_date, requested_start_time, expected_duration_minutes,
    location_name, location_address,
    customer_message, sworn_required, status, repeated_from_booking_id
  ) values (
    p_customer_id, 'customer_portal', 'regular', p_context,
    v_language_from, v_language_to, nullif(btrim(p_language_notes), ''), p_modality,
    p_requested_date, p_requested_start_time, p_expected_duration_minutes,
    nullif(btrim(p_location_name), ''), nullif(btrim(p_location_address), ''),
    nullif(btrim(p_customer_message), ''), coalesce(p_sworn_required, false), 'new',
    p_repeated_from_booking_id
  )
  returning bookings.id, bookings.booking_number into v_booking_id, v_booking_number;

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    v_booking_id,
    'customer_request_created',
    case
      when p_repeated_from_booking_id is not null then 'Aanvraag ontvangen via het klantportaal (opnieuw geboekt).'
      else 'Aanvraag ontvangen via het klantportaal.'
    end,
    jsonb_build_object('repeated_from_booking_id', p_repeated_from_booking_id),
    auth.uid()
  );

  return query select v_booking_id, v_booking_number;
end;
$$;

comment on function public.customer_submit_booking_request is
  'Sole write path for authenticated customer-portal booking requests, covering both a fresh request and "Opnieuw boeken". Validates the caller is an authorised member of p_customer_id via current_customer_ids(), writes a new booking (status=new, source=customer_portal) plus a customer_request_created event, atomically. Every internal/admin-only field is hardcoded, never a parameter. A repeat booking always creates a new row and never touches the original.';

revoke all on function public.customer_submit_booking_request(
  uuid, text, text, text, text, text, boolean, date, time, integer, text, text, text, uuid
) from public;

grant execute on function public.customer_submit_booking_request(
  uuid, text, text, text, text, text, boolean, date, time, integer, text, text, text, uuid
) to authenticated;
