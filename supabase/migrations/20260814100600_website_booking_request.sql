-- The only write path available to unauthenticated website visitors.
--
-- anon/authenticated have zero direct grants on customers, bookings, or
-- booking_events (see earlier migrations). This function is the entire
-- allowlist: its parameter list is exactly and only the fields a visitor is
-- allowed to influence. There is no way to smuggle an interpreter_id,
-- price, margin, status, or internal note through this path, because those
-- columns are never parameters here - they are hardcoded to safe values
-- (status = 'new', source = 'website', interpreter_id/financials/internal
-- notes = NULL) inside the function body.
--
-- SECURITY DEFINER lets it write to tables the calling role otherwise has
-- no grants on at all; search_path is pinned to prevent hijacking, and
-- every input is re-validated here even though the caller (a Next.js
-- Server Action) already validates with zod - the database does not trust
-- the network boundary.
create or replace function public.submit_website_booking_request(
  p_name text,
  p_email text,
  p_phone text,
  p_organisation text,
  p_request_type text,
  p_context text,
  p_language_from text,
  p_language_to text,
  p_language_notes text,
  p_modality text,
  p_desired_date_time_text text,
  p_message text,
  p_form_language text
)
returns table (booking_id uuid, booking_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := nullif(btrim(p_name), '');
  v_email text := nullif(lower(btrim(p_email)), '');
  v_organisation text := nullif(btrim(p_organisation), '');
  v_phone text := nullif(btrim(p_phone), '');
  v_language_from text := nullif(btrim(p_language_from), '');
  v_language_to text := nullif(btrim(p_language_to), '');
  v_customer_id uuid;
  v_matched_existing boolean;
  v_recent_submissions integer;
  v_booking_id uuid;
  v_booking_number text;
begin
  if v_name is null or char_length(v_name) > 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  if v_email is null or char_length(v_email) > 254
     or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  if p_request_type not in ('regular', 'urgent', 'sworn', 'availability', 'other') then
    raise exception 'invalid_request_type' using errcode = '22023';
  end if;

  if p_context not in ('healthcare', 'municipality', 'legal', 'migration', 'business', 'other') then
    raise exception 'invalid_context' using errcode = '22023';
  end if;

  if p_modality is not null and p_modality not in ('telephone', 'video', 'onsite') then
    raise exception 'invalid_modality' using errcode = '22023';
  end if;

  if p_form_language is not null and p_form_language not in ('nl', 'ar') then
    raise exception 'invalid_form_language' using errcode = '22023';
  end if;

  if v_language_from is null or v_language_to is null then
    raise exception 'invalid_language_pair' using errcode = '22023';
  end if;

  -- Conservative customer matching: link to an existing customer only on an
  -- exact, case-insensitive email match. Never overwrite that customer's
  -- stored details from a self-reported resubmission - only the freshly
  -- created booking captures what this visitor typed this time.
  select id into v_customer_id
  from public.customers
  where lower(email) = v_email
  limit 1;

  v_matched_existing := v_customer_id is not null;

  if not v_matched_existing then
    insert into public.customers (type, name, organisation, email, phone)
    values ('individual', v_name, v_organisation, v_email, v_phone)
    returning id into v_customer_id;
  end if;

  -- Light anti-abuse guard against the public endpoint being scripted:
  -- generous enough that no real customer will ever notice it.
  select count(*) into v_recent_submissions
  from public.bookings
  where customer_id = v_customer_id
    and created_at > now() - interval '1 hour';

  if v_recent_submissions >= 5 then
    raise exception 'too_many_requests' using errcode = '55000';
  end if;

  insert into public.bookings (
    customer_id, source, request_type, context,
    language_from, language_to, language_notes, modality,
    customer_message, sworn_required, status, form_language
  ) values (
    v_customer_id, 'website', p_request_type, p_context,
    v_language_from, v_language_to, nullif(btrim(p_language_notes), ''), p_modality,
    nullif(btrim(p_message), ''), (p_request_type = 'sworn'), 'new', p_form_language
  )
  -- Table-qualified on purpose: RETURNS TABLE above implicitly declares
  -- PL/pgSQL variables named booking_id/booking_number, which would
  -- otherwise be ambiguous against the identically named table columns.
  returning bookings.id, bookings.booking_number into v_booking_id, v_booking_number;

  insert into public.booking_events (booking_id, event_type, description, metadata)
  values (
    v_booking_id,
    'booking_created',
    'Aanvraag ontvangen via het website-formulier.',
    jsonb_build_object(
      'source', 'website',
      'submitted_name', v_name,
      'submitted_organisation', v_organisation,
      'desired_date_time_text', nullif(btrim(p_desired_date_time_text), ''),
      'matched_existing_customer', v_matched_existing
    )
  );

  return query select v_booking_id, v_booking_number;
end;
$$;

comment on function public.submit_website_booking_request is
  'Sole public write path for the website request form. Validates and writes a customer (matched conservatively by exact email or newly created) plus a booking (status=new, source=website) plus a booking_created event, atomically. Every internal/admin-only field is hardcoded, never a parameter.';

revoke all on function public.submit_website_booking_request(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) from public;

grant execute on function public.submit_website_booking_request(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;
