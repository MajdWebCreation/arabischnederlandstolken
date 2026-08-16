-- Phase 1 database foundation for the interpreter booking/admin system.
--
-- Design principles applied throughout every migration in this series:
--   * Row Level Security is enabled on every table, default deny.
--   * `anon` (unauthenticated visitors) gets no direct table grants at all
--     on operational tables. The one public write path (the website request
--     form) goes through a single SECURITY DEFINER function that acts as an
--     explicit allowlist of what a visitor may submit - see
--     20260814100600_website_booking_request.sql.
--   * `authenticated` gets table grants, but Row Level Security policies
--     further restrict actual access to admins only (public.is_admin()).
--   * Money is always NUMERIC, never floating point.
--   * Every SECURITY DEFINER function pins `search_path` to prevent
--     search_path hijacking.

-- gen_random_uuid() has been a core Postgres function (no extension needed)
-- since PostgreSQL 13, which is well below Supabase's minimum version.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic BEFORE UPDATE trigger that stamps updated_at with the current time. Attach to any table with an updated_at column.';
