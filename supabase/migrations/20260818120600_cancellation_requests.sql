-- Cancellation-request workflow foundation (Phase 4 brief sections 23-26).
-- Deliberately no automatic fee calculation anywhere in this migration -
-- charge_amount_ex_vat is always a manually entered admin decision, never
-- derived from a staffel/percentage, because the actual cancellation
-- tariff is not yet finalised (see article 13 of the Algemene
-- Voorwaarden). Nothing here creates or touches an invoice either.
--
-- One table serves two distinct customer-facing actions with two distinct
-- request_type values, rather than two tables or one generic "cancel"
-- action: an ordinary contractual cancellation of a confirmed booking
-- (article 13/25), and a consumer's statutory 14-day withdrawal of the
-- distance contract (article 17/18) - kept legally and procedurally
-- distinct per the brief ("do not combine them into one generic cancel
-- action") via the request_type column, separate RPCs, separate customer
-- UI copy, and separate validation rules below, while still sharing one
-- auditable, admin-reviewed table.
create table public.cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,

  request_type text not null check (request_type in ('cancellation', 'consumer_withdrawal')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),

  reason text,
  requested_at timestamptz not null default now(),
  requested_by_user_id uuid references auth.users (id) on delete set null,

  reviewed_at timestamptz,
  reviewed_by_user_id uuid references auth.users (id) on delete set null,
  admin_decision_note text,

  -- Always a manual admin decision - see the file comment above. NULL
  -- means "no charge decided/applicable", not "free": charge_waived is the
  -- explicit "we chose not to charge" signal, distinct from "not decided
  -- yet".
  charge_amount_ex_vat numeric(10, 2) check (charge_amount_ex_vat is null or charge_amount_ex_vat >= 0),
  charge_waived boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cancellation_requests is
  'Admin-reviewed cancellation/withdrawal requests. request_type distinguishes an ordinary contractual cancellation from a consumer''s statutory 14-day withdrawal. charge_amount_ex_vat is always entered manually by admin - never auto-calculated - per the Algemene Voorwaarden''s not-yet-finalised cancellation tariff.';
comment on column public.cancellation_requests.admin_decision_note is 'Admin-only. Never exposed to any customer-facing view.';

create trigger set_cancellation_requests_updated_at
  before update on public.cancellation_requests
  for each row
  execute function public.set_updated_at();

create index cancellation_requests_booking_id_idx on public.cancellation_requests (booking_id);
create index cancellation_requests_status_idx on public.cancellation_requests (status) where status = 'pending';
-- Hard guarantee (not just an application-level check) that a booking never
-- has two simultaneously pending requests.
create unique index cancellation_requests_one_pending_per_booking on public.cancellation_requests (booking_id) where status = 'pending';

alter table public.cancellation_requests enable row level security;

-- No direct insert/update grant for authenticated: every write goes
-- through the narrow RPCs below (customer_request_cancellation for the
-- customer-initiated insert, admin_review_cancellation_request for the
-- admin decision), the same allowlist pattern used throughout this
-- project. Admin can still read directly via the ordinary is_admin() policy.
revoke all on public.cancellation_requests from anon, authenticated;
grant select on public.cancellation_requests to authenticated;

create policy "Admins manage cancellation requests"
  on public.cancellation_requests
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A plain "booking_id in (select id from bookings where customer_id in
-- (...))" USING clause would silently return zero rows here: bookings
-- itself is RLS-protected (admin-only), so a non-admin's own subquery
-- against it is filtered down to nothing before customer_id is even
-- compared - the same reasoning current_customer_ids()/
-- current_interpreter_id() are SECURITY DEFINER for in the first place.
-- This tiny SECURITY DEFINER helper reads bookings as its owner
-- (bypassing that RLS) so the actual ownership check can run, while still
-- only ever answering "yes/no" for the real caller (current_customer_ids()
-- reads the caller's own JWT via auth.uid() regardless of this function's
-- elevated read).
create or replace function public.is_my_customer_booking(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.bookings b
    where b.id = p_booking_id
      and b.customer_id in (select public.current_customer_ids())
  );
$$;

revoke all on function public.is_my_customer_booking(uuid) from public;
grant execute on function public.is_my_customer_booking(uuid) to authenticated;

create policy "Customers can read their own cancellation requests"
  on public.cancellation_requests
  for select
  to authenticated
  using (public.is_my_customer_booking(booking_id));

-- "Annulering aanvragen" for a confirmed booking, and the consumer
-- statutory withdrawal action - two separate customer-facing buttons in
-- the portal, both landing here with a different p_request_type.
create or replace function public.customer_request_cancellation(
  p_booking_id uuid,
  p_request_type text,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_booking record;
  v_customer_type text;
  v_request_id uuid;
begin
  select b.id, b.status, b.customer_id, b.terms_accepted_at into v_booking
  from public.bookings b
  where b.id = p_booking_id
  for update;

  if v_booking.id is null or v_booking.customer_id not in (select public.current_customer_ids()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_request_type not in ('cancellation', 'consumer_withdrawal') then
    raise exception 'invalid_request_type' using errcode = '22023';
  end if;

  select type into v_customer_type from public.customers where id = v_booking.customer_id;

  if p_request_type = 'consumer_withdrawal' then
    if v_customer_type <> 'individual' then
      raise exception 'consumer_withdrawal_requires_individual_customer' using errcode = '55000';
    end if;
    -- The statutory withdrawal right concerns the distance contract, formed
    -- at terms acceptance - it can apply as soon as that has happened, not
    -- only once an interpreter is finally confirmed.
    if v_booking.terms_accepted_at is null then
      raise exception 'no_accepted_contract_to_withdraw_from' using errcode = '55000';
    end if;
    if v_booking.status not in ('customer_accepted', 'interpreter_confirmed', 'confirmed') then
      raise exception 'booking_not_withdrawable' using errcode = '55000';
    end if;
  else
    -- Ordinary contractual cancellation: the brief's own trigger is "for a
    -- confirmed booking" (section 25).
    if v_booking.status not in ('interpreter_confirmed', 'confirmed') then
      raise exception 'booking_not_cancellable' using errcode = '55000';
    end if;
  end if;

  if exists (
    select 1 from public.cancellation_requests
    where booking_id = p_booking_id and status = 'pending'
  ) then
    raise exception 'cancellation_request_already_pending' using errcode = '55000';
  end if;

  insert into public.cancellation_requests (booking_id, request_type, reason, requested_by_user_id)
  values (p_booking_id, p_request_type, nullif(btrim(p_reason), ''), auth.uid())
  returning id into v_request_id;

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    p_booking_id,
    'cancellation_requested',
    case
      when p_request_type = 'consumer_withdrawal' then 'Klant heeft een beroep gedaan op het herroepingsrecht.'
      else 'Klant heeft annulering aangevraagd.'
    end,
    jsonb_build_object('request_type', p_request_type, 'cancellation_request_id', v_request_id),
    auth.uid()
  );

  return v_request_id;
end;
$$;

comment on function public.customer_request_cancellation(uuid, text, text) is
  'Customer-only. Creates a pending cancellation_requests row for the caller''s own booking: request_type=''cancellation'' requires status in (interpreter_confirmed, confirmed); request_type=''consumer_withdrawal'' requires an individual (consumer) customer with an already-accepted contract. Never changes booking.status and never calculates a charge - admin reviews separately.';

-- "Aanvraag intrekken": a pending, not-yet-confirmed request can be closed
-- immediately by the customer with no admin review needed, distinct from
-- the reviewed cancellation_requests flow above.
create or replace function public.customer_withdraw_pending_request(
  p_booking_id uuid,
  p_reason text default null
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
  where b.id = p_booking_id
  for update;

  if v_booking.id is null or v_booking.customer_id not in (select public.current_customer_ids()) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_booking.status not in ('new', 'interpreter_search', 'quoted', 'customer_accepted') then
    raise exception 'booking_already_confirmed' using errcode = '55000';
  end if;

  update public.bookings
  set
    status = 'cancelled',
    request_withdrawn_at = now(),
    request_withdrawn_by_user_id = auth.uid(),
    request_withdrawal_reason = nullif(btrim(p_reason), '')
  where id = p_booking_id;

  insert into public.booking_events (booking_id, event_type, description, created_by)
  values (p_booking_id, 'customer_withdrawn_request', 'Klant heeft de aanvraag ingetrokken.', auth.uid());
end;
$$;

comment on function public.customer_withdraw_pending_request(uuid, text) is
  'Customer-only. Immediately closes the caller''s own not-yet-confirmed request (status must still be new/interpreter_search/quoted/customer_accepted) by setting status=cancelled. No admin review needed - there is no binding confirmed assignment to review.';

-- Admin decision on a pending cancellation_requests row. SECURITY INVOKER
-- like select_interpreter_for_booking: an admin already holds every grant
-- needed (both tables are fully is_admin()-gated), so no elevation is
-- required - only the explicit is_admin() guard at the entry point, kept
-- for the same defensive-style reason.
create or replace function public.admin_review_cancellation_request(
  p_request_id uuid,
  p_decision text,
  p_charge_amount_ex_vat numeric default null,
  p_charge_waived boolean default false,
  p_admin_decision_note text default null
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_request record;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'invalid_decision' using errcode = '22023';
  end if;

  select id, booking_id, status, request_type into v_request
  from public.cancellation_requests
  where id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'cancellation_request_not_found' using errcode = 'P0002';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'cancellation_request_already_reviewed' using errcode = '55000';
  end if;

  update public.cancellation_requests
  set
    status = p_decision,
    reviewed_at = now(),
    reviewed_by_user_id = auth.uid(),
    admin_decision_note = nullif(btrim(coalesce(p_admin_decision_note, '')), ''),
    charge_amount_ex_vat = p_charge_amount_ex_vat,
    charge_waived = coalesce(p_charge_waived, false)
  where id = p_request_id;

  if p_decision = 'approved' then
    -- status_changed is logged automatically by the existing
    -- log_booking_changes trigger on this update.
    update public.bookings set status = 'cancelled' where id = v_request.booking_id;
  end if;

  insert into public.booking_events (booking_id, event_type, description, metadata, created_by)
  values (
    v_request.booking_id,
    case when p_decision = 'approved' then 'cancellation_approved' else 'cancellation_rejected' end,
    case when p_decision = 'approved' then 'Annuleringsverzoek goedgekeurd.' else 'Annuleringsverzoek afgewezen.' end,
    jsonb_build_object(
      'cancellation_request_id', p_request_id,
      'request_type', v_request.request_type,
      'charge_amount_ex_vat', p_charge_amount_ex_vat,
      'charge_waived', coalesce(p_charge_waived, false)
    ),
    auth.uid()
  );
end;
$$;

comment on function public.admin_review_cancellation_request(uuid, text, numeric, boolean, text) is
  'Admin-only. Approves or rejects a pending cancellation_requests row. On approval, sets the booking to cancelled (booking_assignments/interpreter_id are left untouched as a historical record). charge_amount_ex_vat/charge_waived are always the admin''s own manual decision, never calculated here.';

revoke all on function public.customer_request_cancellation(uuid, text, text) from public;
revoke all on function public.customer_withdraw_pending_request(uuid, text) from public;
revoke all on function public.admin_review_cancellation_request(uuid, text, numeric, boolean, text) from public;
grant execute on function public.customer_request_cancellation(uuid, text, text) to authenticated;
grant execute on function public.customer_withdraw_pending_request(uuid, text) to authenticated;
grant execute on function public.admin_review_cancellation_request(uuid, text, numeric, boolean, text) to authenticated;
