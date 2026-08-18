-- Corrects submit_website_booking_request's signature to actually express
-- which parameters are optional.
--
-- Root cause: none of the original 13 parameters had a DEFAULT, so every
-- one was "required" from Postgres's point of view - even though the
-- function body itself already treats p_phone, p_organisation,
-- p_language_notes, p_modality, and p_desired_date_time_text as optional
-- (each is passed through `nullif(btrim(...), '')` or an explicit
-- `is not null and ... not in (...)` check, never a "must be present"
-- validation like the one that guards p_name/p_email/language pair below).
-- supabase-js's generated TypeScript types a parameter as strictly required
-- (no `?`, no `| null`) whenever it has no default, regardless of whether
-- the function happily accepts SQL NULL for it - so the caller, which
-- legitimately has no phone/organisation/language notes/modality/desired
-- date-time for a given website submission, could not satisfy the
-- generated Args type without inventing a fake non-null value. Giving these
-- five parameters `default null` fixes the generated type at the source
-- instead of weakening it in application code.
--
-- Postgres requires defaulted parameters to be trailing, so the five
-- optional ones move to the end of the list. This is safe: the function's
-- only caller (lib/bookings/submit-website-request.ts) invokes it via
-- supabase-js's `.rpc(name, { ...named params... })`, which PostgREST
-- always dispatches as a named-argument call - parameter order is
-- irrelevant to it. Parameter names, types, return type, and the function
-- body are otherwise unchanged from 20260814100600_website_booking_request.sql.
--
-- CREATE OR REPLACE cannot be used for this: Postgres refuses to rename an
-- existing input parameter even when the overall type signature (13x text)
-- is unchanged ("cannot change name of input parameter"), and reordering
-- necessarily moves several parameters to a different position/name-slot.
-- Drop and recreate instead - safe here because nothing else in the schema
-- references this function (grep confirms its only caller is the Next.js
-- Server Action above), and the explicit grants below are reissued
-- immediately after, so there is no window where anon/authenticated lose
-- execute access to anything except within this single migration
-- transaction.
drop function public.submit_website_booking_request(
  text, text, text, text, text, text, text, text, text, text, text, text, text
);

create function public.submit_website_booking_request(
  p_name text,
  p_email text,
  p_request_type text,
  p_context text,
  p_language_from text,
  p_language_to text,
  p_message text,
  p_form_language text,
  p_phone text default null,
  p_organisation text default null,
  p_language_notes text default null,
  p_modality text default null,
  p_desired_date_time_text text default null
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
  'Sole public write path for the website request form. Validates and writes a customer (matched conservatively by exact email or newly created) plus a booking (status=new, source=website) plus a booking_created event, atomically. Every internal/admin-only field is hardcoded, never a parameter. p_phone/p_organisation/p_language_notes/p_modality/p_desired_date_time_text default to null and are genuinely optional; every other parameter is required.';

revoke all on function public.submit_website_booking_request(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) from public;

grant execute on function public.submit_website_booking_request(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;
