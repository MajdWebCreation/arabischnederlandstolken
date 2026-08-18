-- Production-safety fix: Mollie payment links are permanently bound to
-- whichever API key mode created them - a link minted with a test_... key
-- only ever opens Mollie's test checkout, even after MOLLIE_API_KEY is
-- switched to a live_... key. The original Phase 3B reuse check
-- (matching amount only) had no way to know this, so once the app is
-- switched to live mode it could have silently re-emailed a real customer
-- a leftover test-mode link. This column, plus the updated reuse check in
-- lib/invoices/mollie.ts, closes that gap.
alter table public.invoices
  add column mollie_payment_link_mode text check (mollie_payment_link_mode is null or mollie_payment_link_mode in ('test', 'live'));

comment on column public.invoices.mollie_payment_link_mode is
  'Which Mollie API key mode (test_... vs live_...) created mollie_payment_link_id, derived server-side from MOLLIE_API_KEY at creation time - never client-supplied. A stored link is only ever reused when this still matches the server''s current mode; a mode mismatch (e.g. a test-mode link left over from before switching to a live key) always creates a fresh link instead of reusing the stale one.';

-- Every link that exists as of this migration was necessarily created
-- before this project ever had a live key configured (Phase 3B's own
-- brief: "The configured key will initially be a Mollie TEST API key" -
-- confirmed switched to live only afterward), so backfilling 'test' for
-- any already-stored link is not a guess, it's a documented fact about
-- this project's timeline. This is what makes the very next invoice send
-- for any such row correctly detect the mode mismatch and mint a fresh
-- live link, rather than leaving the backfill itself ambiguous.
update public.invoices
set mollie_payment_link_mode = 'test'
where mollie_payment_url is not null
  and mollie_payment_link_mode is null;

-- Purely additive to the existing invoices_mollie_link_id_and_url_together
-- constraint (20260818121000_invoice_mollie_payment_links.sql, left
-- untouched) rather than replacing it - same "all four mollie_* fields are
-- either all null or all meaningfully set" invariant, extended to cover
-- the new column without needing to drop/recreate the original check.
alter table public.invoices
  add constraint invoices_mollie_link_mode_matches_link check (
    (mollie_payment_link_id is null) = (mollie_payment_link_mode is null)
  );
