-- Invoice data model: invoices + invoice_items.
--
-- bookings.interpreter_cost_ex_vat and every interpreter-side field stay
-- exactly where Phase 1/2 put them - nothing here reads or exposes them.
-- An invoice is built entirely from customer-facing amounts (typically
-- bookings.customer_price_ex_vat / customer_travel_fee_ex_vat, copied into
-- invoice_items at draft-creation time, never referenced live afterward).
--
-- A booking may have zero, one, or several invoices over time (initial,
-- overtime, correction, additional costs, ...) - booking_id is a plain
-- nullable reference, not unique, on purpose.
create table public.invoices (
  id uuid primary key default gen_random_uuid(),

  -- NULL while draft. Assigned exactly once, atomically, by issue_invoice()
  -- (20260818100500_issue_invoice.sql) - never derived by the application.
  invoice_number text unique,

  status text not null default 'draft' check (status in (
    'draft', 'issued', 'sent', 'paid', 'cancelled'
  )),

  customer_id uuid not null references public.customers (id) on delete restrict,
  booking_id uuid references public.bookings (id) on delete set null,

  -- Editable while draft (defaults applied at creation time in application
  -- code: today / business_settings.payment_term_days). Locked in place by
  -- issue_invoice(), which also fills them in if still unset at that point.
  invoice_date date,
  due_date date,
  payment_term_days integer not null default 14 check (payment_term_days > 0),

  currency text not null default 'EUR' check (currency = 'EUR'),

  -- Aggregates of invoice_items, kept in sync by
  -- recalculate_invoice_totals() (20260818100300_invoice_totals_trigger.sql)
  -- rather than trusted from the browser - see that file for why.
  subtotal_ex_vat numeric(10, 2) not null default 0 check (subtotal_ex_vat >= 0),
  total_vat numeric(10, 2) not null default 0 check (total_vat >= 0),
  total_inc_vat numeric(10, 2) not null default 0 check (total_inc_vat >= 0),

  -- Optional short note printed on the invoice for the customer (e.g. a
  -- reference/PO number). Never admin-only content - see internal_notes on
  -- bookings/customers for that.
  customer_note text,

  -- Written once, atomically, by issue_invoice(). NULL while draft, by
  -- design - a draft preview renders from the *current* business_settings/
  -- customers rows instead (see the PDF route handler), which is fine
  -- precisely because nothing about a draft is final yet.
  seller_snapshot jsonb,
  customer_snapshot jsonb,

  -- Path within the private `invoices` Storage bucket
  -- (20260818100600_invoice_storage.sql) to the exact PDF that was issued.
  -- Set once, alongside seller/customer_snapshot. A draft has no stored
  -- PDF - its preview is always generated live.
  pdf_storage_path text,

  sent_at timestamptz,
  sent_to_email text,
  paid_at timestamptz,
  cancelled_at timestamptz,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.invoices is
  'Customer invoices. status=draft is freely editable; issue_invoice() atomically assigns invoice_number, freezes seller/customer_snapshot, and moves status to issued, after which enforce_invoice_immutability() blocks any further change to financial/identity fields.';
comment on column public.invoices.seller_snapshot is
  'Immutable copy of business_settings as printed on this invoice at issue time. Editing business_settings later must never change this.';
comment on column public.invoices.customer_snapshot is
  'Immutable copy of the customer''s billing details as printed on this invoice at issue time. Editing the customer record later must never change this.';

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row
  execute function public.set_updated_at();

create index invoices_customer_id_idx on public.invoices (customer_id);
create index invoices_booking_id_idx on public.invoices (booking_id) where booking_id is not null;
create index invoices_status_idx on public.invoices (status);
create index invoices_created_at_idx on public.invoices (created_at desc);

alter table public.invoices enable row level security;

revoke all on public.invoices from anon, authenticated;
-- No delete grant: invoices are financial/audit records, same reasoning as
-- bookings. Cancelling is a status, not a deletion.
grant select, insert, update on public.invoices to authenticated;

create policy "Admins manage invoices"
  on public.invoices
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Invoice line items. quantity/unit_price_ex_vat/vat_rate are the only
-- inputs an admin (or a draft-generation action) ever supplies - the three
-- money columns are GENERATED, computed by Postgres itself from those
-- inputs, so a line item's stored totals can never disagree with its own
-- quantity/price/rate, regardless of what a client sends or omits.
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,

  position integer not null default 0,
  description text not null check (btrim(description) <> ''),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price_ex_vat numeric(10, 2) not null check (unit_price_ex_vat >= 0),
  vat_rate numeric(5, 2) not null default 21.00 check (vat_rate >= 0 and vat_rate <= 100),

  line_subtotal_ex_vat numeric(10, 2)
    generated always as (round(quantity * unit_price_ex_vat, 2)) stored,
  line_vat_amount numeric(10, 2)
    generated always as (round(quantity * unit_price_ex_vat * vat_rate / 100, 2)) stored,
  -- Sum of the two generated columns above, not an independent
  -- round(qty*price*(1+rate/100)) - guarantees subtotal + vat = total holds
  -- exactly for every line, with no possibility of a stray rounding cent.
  line_total_inc_vat numeric(10, 2)
    generated always as (
      round(quantity * unit_price_ex_vat, 2)
      + round(quantity * unit_price_ex_vat * vat_rate / 100, 2)
    ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.invoice_items is
  'Invoice line items. line_subtotal_ex_vat/line_vat_amount/line_total_inc_vat are database-generated from quantity/unit_price_ex_vat/vat_rate - they cannot be set directly by any INSERT/UPDATE, so a client can never supply a mismatched total.';

create trigger set_invoice_items_updated_at
  before update on public.invoice_items
  for each row
  execute function public.set_updated_at();

create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id, position);

alter table public.invoice_items enable row level security;

revoke all on public.invoice_items from anon, authenticated;
grant select, insert, update, delete on public.invoice_items to authenticated;

create policy "Admins manage invoice items"
  on public.invoice_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
