-- Phase 4 foundation: lightweight, admin-managed booking defaults per
-- customer, plus the (currently inert) auto-confirm preparation column.
--
-- Deliberately plain columns on customers rather than a new table: the
-- brief explicitly asks for "a lightweight saved/default booking
-- preference model", not a tariff/template system, and a customer has at
-- most one set of defaults today. Every field here is optional and is only
-- ever used to prefill a new request - the customer can always override
-- per request (enforced in application code, not here).
--
-- These are admin-managed, not customer-self-edited (see the Phase 4
-- customer-portal-membership migration's self-edit trigger, which blocks
-- a non-admin from changing any column added here) - they reflect what the
-- agency knows about a regular customer's usual pattern, matching the
-- brief's "Optionally add admin-managed customer settings" wording.
alter table public.customers
  add column default_language_from text,
  add column default_language_to text,
  add column default_language_notes text,
  add column default_context text check (default_context is null or default_context in ('healthcare', 'municipality', 'legal', 'migration', 'business', 'other')),
  add column default_modality text check (default_modality is null or default_modality in ('telephone', 'video', 'onsite')),
  add column default_sworn_required boolean not null default false,
  add column default_duration_minutes integer check (default_duration_minutes is null or default_duration_minutes > 0),
  add column default_location_name text,
  add column default_location_address text,
  -- Prepared for a future trusted-customer auto-confirm policy (see the
  -- Phase 4 brief, "Future auto-confirm support"). Always false today and
  -- not read by any workflow yet - selecting an interpreter always still
  -- requires an explicit admin action and always still triggers the normal
  -- customer confirmation email, regardless of this column's value.
  add column auto_confirm_when_interpreter_selected boolean not null default false;

comment on column public.customers.default_language_from is 'Admin-set default for prefilling this customer''s new booking requests. Never binding - always overridable per request.';
comment on column public.customers.default_duration_minutes is 'Admin-set default expected duration in minutes, used only to prefill new requests.';
comment on column public.customers.auto_confirm_when_interpreter_selected is 'Reserved for a future trusted-customer auto-confirm policy. Not read by any Phase 4 workflow - admin selection of an interpreter always triggers the normal customer confirmation step regardless of this value.';
