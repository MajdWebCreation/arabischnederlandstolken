-- The three generated columns on invoice_items (line_subtotal_ex_vat,
-- line_vat_amount, line_total_inc_vat) can never actually be null - their
-- generation expressions only reference quantity/unit_price_ex_vat/vat_rate,
-- all three of which are themselves `not null`. But
-- 20260818100200_invoices.sql didn't declare that explicitly, so Postgres's
-- catalog (correctly, given what was actually declared) reports them as
-- nullable, and `supabase gen types` follows suit with `number | null` -
-- exactly the class of "real invariant, needlessly nullable type" gap this
-- project has already had to fix once for view columns. Unlike that
-- earlier case, this one genuinely is a schema fix: a plain NOT NULL is
-- both correct and sufficient.
alter table public.invoice_items
  alter column line_subtotal_ex_vat set not null,
  alter column line_vat_amount set not null,
  alter column line_total_inc_vat set not null;
