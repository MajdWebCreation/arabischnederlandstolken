-- Replaces the single free-text customers.billing_address as what an
-- invoice actually requires and prints, with structured Dutch address
-- fields. billing_address is deliberately NOT dropped or auto-parsed here:
-- guessing how to split existing free text into street/house
-- number/postcode/city risks fabricating a wrong value on what becomes a
-- legal document, which is worse than leaving the new fields blank for the
-- admin to re-enter deliberately. Any previously-entered value stays
-- intact in the (now legacy) column - see customer-form.tsx, which shows
-- it as a read-only reference next to the new fields.
alter table public.customers
  add column billing_street text,
  add column billing_house_number text,
  add column billing_house_number_addition text,
  add column billing_postal_code text,
  add column billing_city text;

comment on column public.customers.billing_address is
  'Deprecated: superseded by billing_street/billing_house_number/billing_house_number_addition/billing_postal_code/billing_city. No longer read by issue_invoice() or written into any new invoice snapshot - kept only so a previously-entered free-text address is never silently discarded.';
comment on column public.customers.billing_street is 'Straatnaam, without the house number.';
comment on column public.customers.billing_house_number is 'Huisnummer, without any addition - see billing_house_number_addition.';
comment on column public.customers.billing_house_number_addition is 'Optional addition/suffix to the house number (e.g. "A", "2 hoog").';
comment on column public.customers.billing_postal_code is 'Dutch postcode, e.g. "1234 AB".';
comment on column public.customers.billing_city is 'Plaats.';
