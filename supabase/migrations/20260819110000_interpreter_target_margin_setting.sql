-- Admin-only planning/helper setting: the default target gross margin used
-- to suggest an interpreter compensation figure on the booking admin page
-- (Klantprijs excl. btw x (1 - doelmarge/100)). Stored centrally alongside
-- the rest of business_settings, the same place invoice_prefix/
-- payment_term_days already live, rather than hardcoded anywhere in the
-- application.
--
-- This is never the official interpreter compensation - bookings.interpreter_cost_ex_vat
-- remains the sole source of truth for what an interpreter is actually
-- paid/invoiced for (see select_interpreter_for_booking() and
-- issue_interpreter_invoice(), neither of which this migration touches),
-- and business_settings itself already carries no RLS grant for anyone but
-- admin - see 20260818100000_business_settings.sql. No customer- or
-- interpreter-facing view/RPC ever reads this table at all, so this new
-- column is exposed nowhere else by construction.
alter table public.business_settings
  add column default_interpreter_target_margin_percent numeric(5, 2) not null default 15.00
    check (default_interpreter_target_margin_percent >= 0 and default_interpreter_target_margin_percent <= 100);

comment on column public.business_settings.default_interpreter_target_margin_percent is
  'Admin-only planning helper: default target gross margin (%) suggested when preparing an interpreter compensation figure on a booking. Never the official/agreed amount - that is always bookings.interpreter_cost_ex_vat, explicitly confirmed by admin. Never exposed to customers or interpreters.';
