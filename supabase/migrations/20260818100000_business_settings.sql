-- Business settings: the single source of truth for the agency's own
-- invoicing details (legal name, address, KVK, BTW-id, IBAN, invoice
-- numbering prefix, default payment term, footer text).
--
-- This is a singleton table by convention, not by a hard DB constraint:
-- exactly one row is seeded below, and no application code path ever
-- inserts a second row (the settings editor only ever UPDATEs the existing
-- row). Deliberately not versioned/history-tracked here - editing these
-- values must never rewrite a historical invoice, but that guarantee is
-- provided by invoices.seller_snapshot (see 20260818100200_invoices.sql),
-- not by keeping old business_settings rows around.
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),

  company_name text not null check (btrim(company_name) <> ''),
  address_line text not null check (btrim(address_line) <> ''),
  postal_code text not null check (btrim(postal_code) <> ''),
  city text not null check (btrim(city) <> ''),
  country text not null default 'Nederland',

  kvk_number text not null check (btrim(kvk_number) <> ''),
  -- The customer-facing BTW-identificatienummer, never the internal
  -- omzetbelastingnummer - deliberately one field, named for exactly what
  -- belongs on a customer invoice, so nothing else can be pasted in here by
  -- mistake.
  vat_id text not null check (btrim(vat_id) <> ''),
  iban text not null check (btrim(iban) <> ''),

  website text not null,
  email text,

  invoice_prefix text not null default 'ANT-F' check (btrim(invoice_prefix) <> ''),
  payment_term_days integer not null default 14 check (payment_term_days > 0),
  footer_text text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.business_settings is
  'Singleton (exactly one row, enforced by convention) holding the agency''s own invoicing details. Historical invoices never read this table live - see invoices.seller_snapshot.';
comment on column public.business_settings.vat_id is
  'The customer-facing BTW-identificatienummer for use on invoices. Never the internal omzetbelastingnummer.';

create trigger set_business_settings_updated_at
  before update on public.business_settings
  for each row
  execute function public.set_updated_at();

alter table public.business_settings enable row level security;

revoke all on public.business_settings from anon, authenticated;
-- No insert/delete grant for authenticated: the singleton row already
-- exists (seeded below), and the app only ever edits it in place. Keeping
-- insert ungranted means an application bug can never silently create a
-- second row.
grant select, update on public.business_settings to authenticated;

create policy "Admins manage business settings"
  on public.business_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.business_settings (
  company_name, address_line, postal_code, city, country,
  kvk_number, vat_id, iban, website, invoice_prefix, payment_term_days
) values (
  'Arabisch Nederlands Tolken',
  'Patrijzenweg 1',
  '1121 EX',
  'Landsmeer',
  'Nederland',
  '96175354',
  'NL005193483B19',
  'NL70RABO0172714958',
  'arabischnederlandstolken.nl',
  'ANT-F',
  14
);
