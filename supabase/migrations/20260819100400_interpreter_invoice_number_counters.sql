-- Race-safe numbering for issued self-billing invoices, completely separate
-- from invoice_number_counters (customer invoices, ANT-F-...) - mirrors it
-- exactly. Numbers look like ANT-SB-2026-000001, assigned only by
-- issue_interpreter_invoice() (20260819100500_interpreter_invoice_workflow_rpcs.sql),
-- never a `select max(...) + 1`.
create table public.interpreter_invoice_number_counters (
  year integer primary key,
  last_value integer not null default 0
);

comment on table public.interpreter_invoice_number_counters is
  'One row per calendar year (Europe/Amsterdam). Tracks the last issued self-billing invoice sequence number for that year. Only ever touched internally by issue_interpreter_invoice(). Entirely separate sequence from invoice_number_counters (customer invoices).';

alter table public.interpreter_invoice_number_counters enable row level security;
revoke all on public.interpreter_invoice_number_counters from anon, authenticated;
-- Deliberately no policies and no grants: only issue_interpreter_invoice()
-- (SECURITY DEFINER) ever touches this table.
