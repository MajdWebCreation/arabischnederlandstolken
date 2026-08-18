-- Mollie Payment Links integration for the existing "Factuur verzenden"
-- flow (Phase 3B addendum). Mollie only ever supplies a payment button/URL
-- here - it is never a second source of truth for invoice numbers,
-- amounts, PDFs, or status. These columns are a thin, admin-only cache of
-- what Mollie returned for one specific issued invoice, so a resend can
-- reuse the same link instead of minting a new one every time.
--
-- Plain columns on invoices rather than a separate table: this is
-- inherently a 1:1 relationship (one issued invoice has at most one active
-- payment link, exactly mirroring how pdf_storage_path already works on
-- this same table), so a second table would only add a join for no
-- benefit.
alter table public.invoices
  add column mollie_payment_link_id text,
  add column mollie_payment_url text,
  -- Integer cents (not NUMERIC euros like every other money column here)
  -- deliberately: this is compared against invoice totals purely in
  -- application code via lib/money.ts's existing cents-arithmetic helpers,
  -- never in SQL, so it matches that layer's own convention instead of the
  -- database's.
  add column mollie_payment_link_amount_cents integer check (mollie_payment_link_amount_cents is null or mollie_payment_link_amount_cents >= 0),
  add column mollie_payment_link_created_at timestamptz,
  add constraint invoices_mollie_link_id_and_url_together check (
    (mollie_payment_link_id is null) = (mollie_payment_url is null)
  );

comment on column public.invoices.mollie_payment_link_id is
  'Mollie payment-link id (e.g. "pl_..."), admin-only. Set once a link has been created for this invoice''s immutable issued amount; reused on resend rather than recreated - see sendInvoiceAction.';
comment on column public.invoices.mollie_payment_url is
  'The Mollie-hosted payment page URL for mollie_payment_link_id. Safe to include in the customer''s own invoice email, but never shown in the admin-only invoice_events audit trail beyond this column itself.';
comment on column public.invoices.mollie_payment_link_amount_cents is
  'The exact amount (in cents) the stored Mollie link was created for. Compared against the invoice''s own (immutable, post-issue) total_inc_vat before reuse, as a defensive check on top of the fact that total_inc_vat cannot itself change after issuing.';

-- No RLS/grant changes needed: invoices already has no non-admin SELECT
-- access at all (Phase 1's is_admin()-only policy), and the customer-facing
-- my_customer_invoices view (20260818120900_customer_invoice_pdf_access.sql)
-- explicitly does not select these new columns - a customer's invoice
-- email may safely contain the payment URL, but the customer portal itself
-- never exposes this admin-only metadata.
--
-- enforce_invoice_immutability() (20260818100500_invoice_immutability.sql)
-- is intentionally not touched: its column allowlist already only guards
-- invoice_number/customer_id/booking_id/dates/amounts/snapshots, so writing
-- these new mollie_* columns on an already-issued invoice continues to be
-- allowed, exactly like sent_at/paid_at/pdf_storage_path already are.
