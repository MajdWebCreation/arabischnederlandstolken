-- Customers: individuals or organisations who book an interpreter.
--
-- No direct grants to anon or authenticated-non-admin. The only public
-- write path is the SECURITY DEFINER function added in
-- 20260814100600_website_booking_request.sql, which bypasses these grants
-- by design and acts as the sole, narrow allowlist for what a website
-- visitor may cause to be written here.

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'individual' check (type in ('individual', 'business')),
  name text not null check (btrim(name) <> ''),
  organisation text,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  billing_name text,
  billing_email text check (billing_email is null or billing_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  billing_address text,
  kvk_number text,
  vat_number text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is
  'Individuals or organisations who book interpreters. Created from website requests and maintained by admin.';
comment on column public.customers.internal_notes is
  'Admin-only. Never expose outside the admin environment.';

create trigger set_customers_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

-- Used both for conservative email-based customer matching on new website
-- requests and for the admin customer search.
create index customers_email_idx on public.customers (lower(email));
create index customers_organisation_idx on public.customers (organisation) where organisation is not null;
create index customers_created_at_idx on public.customers (created_at desc);

alter table public.customers enable row level security;

revoke all on public.customers from anon, authenticated;
-- No delete grant: nothing in Phase 1 needs to delete a customer, and
-- bookings reference customers with ON DELETE RESTRICT anyway.
grant select, insert, update on public.customers to authenticated;

create policy "Admins manage customers"
  on public.customers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
