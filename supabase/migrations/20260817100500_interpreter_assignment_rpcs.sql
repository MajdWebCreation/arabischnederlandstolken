-- The only write path available to interpreters for their own assignment
-- offers. booking_assignments has no direct insert/update grant for
-- authenticated (see the previous migration) - these two functions are the
-- entire allowlist of what an interpreter can change, and each validates
-- the transition itself rather than trusting RLS alone to get it right.

-- Called when an interpreter opens an assignment's detail page. Lenient by
-- design: a mismatched owner or an already-progressed assignment is a safe
-- no-op, not an error - this avoids leaking any information through error
-- responses about assignments that aren't the caller's.
create or replace function public.interpreter_mark_assignment_viewed(p_assignment_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  update public.booking_assignments
  set status = 'viewed', viewed_at = coalesce(viewed_at, now())
  where id = p_assignment_id
    and interpreter_id = v_interpreter_id
    and status = 'invited';
end;
$$;

comment on function public.interpreter_mark_assignment_viewed(uuid) is
  'Stamps viewed_at and advances status invited -> viewed for the caller''s own assignment offer. No-ops harmlessly if the id isn''t theirs or the offer has already moved past ''invited''.';

-- Express interest or decline. Every check happens against the database's
-- own current state (not whatever the client thinks is true), and the row
-- is locked for the duration so two near-simultaneous responses can't both
-- believe they succeeded.
create or replace function public.interpreter_respond_to_assignment(
  p_assignment_id uuid,
  p_response text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_interpreter_id uuid;
  v_current record;
  v_already_filled boolean;
begin
  v_interpreter_id := public.current_interpreter_id();

  if v_interpreter_id is null then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_response not in ('interested', 'declined') then
    raise exception 'invalid_response' using errcode = '22023';
  end if;

  select id, booking_id, status, expires_at into v_current
  from public.booking_assignments
  where id = p_assignment_id and interpreter_id = v_interpreter_id
  for update;

  if v_current.id is null then
    raise exception 'assignment_not_found' using errcode = 'P0002';
  end if;

  if v_current.status not in ('invited', 'viewed') then
    raise exception 'assignment_not_respondable' using errcode = '55000';
  end if;

  if v_current.expires_at is not null and v_current.expires_at < now() then
    raise exception 'assignment_expired' using errcode = '55000';
  end if;

  if p_response = 'interested' then
    select exists (
      select 1 from public.booking_assignments
      where booking_id = v_current.booking_id and status = 'selected'
    ) into v_already_filled;

    if v_already_filled then
      raise exception 'assignment_already_filled' using errcode = '55000';
    end if;
  end if;

  update public.booking_assignments
  set status = p_response, responded_at = now()
  where id = p_assignment_id;
end;
$$;

comment on function public.interpreter_respond_to_assignment(uuid, text) is
  'Lets the caller express interest in or decline their own assignment offer. Rejects offers that aren''t theirs, aren''t in a respondable state, have expired, or (for "interested") belong to a booking already filled by someone else.';

revoke all on function public.interpreter_mark_assignment_viewed(uuid) from public;
revoke all on function public.interpreter_respond_to_assignment(uuid, text) from public;
grant execute on function public.interpreter_mark_assignment_viewed(uuid) to authenticated;
grant execute on function public.interpreter_respond_to_assignment(uuid, text) to authenticated;
