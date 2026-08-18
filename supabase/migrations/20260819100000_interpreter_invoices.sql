-- Interpreter self-billing settlements/invoices: a completely separate
-- accounting stream from public.invoices (customer sales invoices, Arabisch
-- Nederlands Tolken -> customer). This is the reverse direction - the
-- interpreter's own supplier invoice to Arabisch Nederlands Tolken, raised
-- on their behalf under a self-billing (self-facturering) agreement - so it
-- gets its own dedicated tables, its own numbering sequence (ANT-SB-...,
-- see 20260819100400_interpreter_invoice_number_counters.sql), and its own
-- RLS boundary. Nothing here ever reads bookings.customer_price_ex_vat or
-- any customer-facing amount - see the settlement-creation Server Action
-- (app/admin/(dashboard)/interpreter-invoices/actions.ts), which only ever
-- reads bookings.interpreter_cost_ex_vat / interpreter_travel_cost_ex_vat as
-- *proposed* starting values for admin to confirm.
--
-- One completed booking has at most one *active* (non-cancelled) settlement
-- at a time - see the partial unique index below. Only the booking's own
-- bookings.interpreter_id (the final, confirmed interpreter - see
-- 20260817100300_booking_assignments.sql) may ever be the interpreter_id
-- here; enforced in the settlement-creation Server Action, not a DB
-- constraint (booking_assignments' history of who else was invited/
-- interested is irrelevant here).
create table public.interpreter_invoices (
  id uuid primary key default gen_random_uuid(),

  -- NULL until issue_interpreter_invoice() assigns it atomically - see
  -- 20260819100500_interpreter_invoice_workflow_rpcs.sql.
  invoice_number text unique,

  interpreter_id uuid not null references public.interpreters (id) on delete restrict,
  booking_id uuid not null references public.bookings (id) on delete restrict,

  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'change_requested', 'approved', 'issued', 'paid', 'cancelled'
  )),

  currency text not null default 'EUR' check (currency = 'EUR'),

  -- Sum of interpreter_invoice_items, kept in sync by
  -- recalculate_interpreter_invoice_totals()
  -- (20260819100100_interpreter_invoice_totals_trigger.sql) - never trusted
  -- from the browser.
  subtotal_ex_vat numeric(10, 2) not null default 0 check (subtotal_ex_vat >= 0),

  -- The interpreter's declared VAT handling for THIS settlement. Defaulted
  -- from interpreters.vat_treatment when the draft is created (a proposal,
  -- not a guess about tax law), editable by admin while draft/
  -- change_requested, frozen from 'approved' onward - see
  -- 20260819100300_interpreter_invoice_immutability.sql. Never inferred
  -- from missing vat_id.
  vat_treatment_snapshot text check (vat_treatment_snapshot is null or vat_treatment_snapshot in ('standard_vat', 'kor', 'no_vat', 'other')),
  -- Only meaningful (and required at issue time) when vat_treatment_snapshot
  -- = 'standard_vat'. KOR/no_vat/other charge no VAT amount - see
  -- recalculate_interpreter_invoice_vat().
  vat_rate numeric(5, 2) check (vat_rate is null or (vat_rate >= 0 and vat_rate <= 100)),
  vat_amount numeric(10, 2) not null default 0 check (vat_amount >= 0),
  total_inc_vat numeric(10, 2) not null default 0 check (total_inc_vat >= 0),
  -- Required before issue when vat_treatment_snapshot is 'no_vat' or
  -- 'other' (never guessed - see issue_interpreter_invoice()). Optional
  -- free text otherwise, e.g. to note something for the interpreter/admin.
  fiscal_note text,

  -- Supplier (= the interpreter) snapshot, frozen by issue_interpreter_invoice().
  -- Flat columns (not one jsonb blob) per the brief's explicit field list.
  -- All NULL until issued.
  supplier_legal_name text,
  supplier_trade_name text,
  supplier_street text,
  supplier_house_number text,
  supplier_house_number_addition text,
  supplier_postal_code text,
  supplier_city text,
  supplier_kvk_number text,
  supplier_vat_id text,
  supplier_iban text,
  supplier_account_holder_name text,

  -- Buyer (= Arabisch Nederlands Tolken, always - self-billing is always
  -- issued to the same legal buyer) snapshot, frozen at the same moment
  -- from business_settings. All NULL until issued.
  buyer_name text,
  buyer_address text,
  buyer_kvk text,
  buyer_vat_id text,

  -- Descriptive facts about the underlying service (date, modality,
  -- languages, actual duration) as shown on the PDF - frozen alongside the
  -- supplier/buyer snapshot so a later edit to the booking can never change
  -- an already-issued document (brief section 10). Not itself a field the
  -- brief enumerates by name, but the same immutability guarantee it asks
  -- for requires it - the supplier/buyer snapshot alone would leave the
  -- service description live-editable via the booking.
  booking_snapshot jsonb,

  -- Self-billing approval. Written only by interpreter_approve_settlement()
  -- - see 20260819100500_interpreter_invoice_workflow_rpcs.sql - never a
  -- direct UPDATE, even from the interpreter's own session (no UPDATE RLS
  -- policy is granted to interpreters on this table at all - see below).
  self_billing_terms_version text,
  interpreter_approved_at timestamptz,
  interpreter_approved_by uuid references auth.users (id) on delete set null,
  constraint interpreter_invoices_approval_together check (
    (interpreter_approved_at is null) = (interpreter_approved_by is null)
    and (interpreter_approved_at is null) = (self_billing_terms_version is null)
  ),

  -- Most recent "Wijziging aanvragen" message, for a quick admin-facing
  -- summary - see interpreter_invoice_events for the full historical trail
  -- (including earlier change requests, if a settlement is resubmitted more
  -- than once).
  last_change_request_message text,

  issued_at timestamptz,
  paid_at timestamptz,
  paid_by uuid references auth.users (id) on delete set null,
  cancelled_at timestamptz,

  -- Path within the private `interpreter-invoices` Storage bucket
  -- (20260819100700_interpreter_invoice_storage.sql). NULL until issued -
  -- a draft/pending settlement has no PDF at all (unlike customer invoices,
  -- which render a *live* draft preview - a self-billing settlement isn't
  -- shown as a PDF before issue, only as the review screen in /tolk/facturen).
  pdf_storage_path text,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.interpreter_invoices is
  'Interpreter self-billing settlements/invoices (interpreter -> Arabisch Nederlands Tolken, supplier cost). Completely separate from public.invoices (customer sales invoices). Workflow: draft -> pending_review -> (change_requested -> pending_review)* -> approved -> issued -> paid, or cancelled from any pre-issued state. Financial/identity fields are freely editable only while status is draft or change_requested - see enforce_interpreter_invoice_immutability().';
comment on column public.interpreter_invoices.booking_id is
  'The completed booking this settlement is for. Only bookings.interpreter_id (the final, confirmed interpreter) may ever be the interpreter_id on this row - validated in the settlement-creation Server Action, not a DB constraint.';
comment on column public.interpreter_invoices.supplier_iban is
  'Admin/interpreter-only. Never exposed to any customer-facing code path - there is none that could even join to this table (customers have no relationship to interpreter_invoices at all).';

-- One active (non-cancelled) settlement per booking at a time. A cancelled
-- row does not block a fresh draft for the same booking - see brief section
-- 5 ("prevent duplicate active/issued invoices for the same booking").
create unique index interpreter_invoices_one_active_per_booking
  on public.interpreter_invoices (booking_id)
  where status <> 'cancelled';

create trigger set_interpreter_invoices_updated_at
  before update on public.interpreter_invoices
  for each row
  execute function public.set_updated_at();

create index interpreter_invoices_interpreter_id_idx on public.interpreter_invoices (interpreter_id);
create index interpreter_invoices_status_idx on public.interpreter_invoices (status);
create index interpreter_invoices_created_at_idx on public.interpreter_invoices (created_at desc);

alter table public.interpreter_invoices enable row level security;

revoke all on public.interpreter_invoices from anon, authenticated;
-- No delete grant: financial/audit records, same reasoning as invoices and
-- bookings. Cancelling is a status, not a deletion.
grant select, insert, update on public.interpreter_invoices to authenticated;

create policy "Admins manage interpreter invoices"
  on public.interpreter_invoices
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Interpreters may only ever SELECT their own rows, and only once a
-- settlement has actually been sent to them for review - a draft is
-- admin-only-visible, exactly like a customer invoice's draft status is
-- invisible to the customer (see my_customer_invoices). No UPDATE policy is
-- granted here at all: every interpreter-side state change (approve,
-- request change) goes through a narrow SECURITY DEFINER RPC instead - see
-- 20260819100500_interpreter_invoice_workflow_rpcs.sql - mirroring
-- booking_assignments' "no interpreter UPDATE grant, RPCs only" pattern.
create policy "Interpreters can read their own non-draft settlements"
  on public.interpreter_invoices
  for select
  to authenticated
  using (interpreter_id = public.current_interpreter_id() and status <> 'draft');

-- Settlement line items. Deliberately no per-line vat_rate (unlike
-- invoice_items) - VAT treatment is a single decision per settlement (see
-- vat_treatment_snapshot/vat_rate on the parent row), not something that
-- varies line by line for one interpreter's own invoice.
create table public.interpreter_invoice_items (
  id uuid primary key default gen_random_uuid(),
  interpreter_invoice_id uuid not null references public.interpreter_invoices (id) on delete cascade,

  sort_order integer not null default 0,
  description text not null check (btrim(description) <> ''),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  -- Free-text unit label (e.g. "uur", "km", "vast") - deliberately not an
  -- enum, so it can describe tolkenvergoeding, reiskosten, overwerk, or any
  -- other explicitly agreed compensation without a schema change.
  unit text,
  unit_price_ex_vat numeric(10, 2) not null check (unit_price_ex_vat >= 0),

  amount_ex_vat numeric(10, 2)
    generated always as (round(quantity * unit_price_ex_vat, 2)) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.interpreter_invoice_items is
  'Settlement line items (tolkenvergoeding, reiskosten, overwerk, overig). amount_ex_vat is database-generated from quantity * unit_price_ex_vat, so it can never disagree with its own inputs.';

create trigger set_interpreter_invoice_items_updated_at
  before update on public.interpreter_invoice_items
  for each row
  execute function public.set_updated_at();

create index interpreter_invoice_items_invoice_id_idx
  on public.interpreter_invoice_items (interpreter_invoice_id, sort_order);

alter table public.interpreter_invoice_items enable row level security;

revoke all on public.interpreter_invoice_items from anon, authenticated;
grant select, insert, update, delete on public.interpreter_invoice_items to authenticated;

create policy "Admins manage interpreter invoice items"
  on public.interpreter_invoice_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- A plain EXISTS subquery against interpreter_invoices is safe here (unlike
-- the cancellation_requests/invoice-PDF cases elsewhere in this project,
-- which needed a SECURITY DEFINER helper): interpreter_invoices itself
-- already grants the interpreter SELECT on their own non-draft rows via the
-- policy above, so this subquery sees exactly the same rows the interpreter
-- can already see directly - it is not filtered down to nothing the way a
-- subquery against a fully admin-only table would be.
create policy "Interpreters can read their own settlement line items"
  on public.interpreter_invoice_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.interpreter_invoices ii
      where ii.id = interpreter_invoice_items.interpreter_invoice_id
        and ii.interpreter_id = public.current_interpreter_id()
        and ii.status <> 'draft'
    )
  );
