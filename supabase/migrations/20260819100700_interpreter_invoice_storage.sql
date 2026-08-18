-- Private Storage bucket for issued self-billing PDFs, completely separate
-- from the `invoices` bucket (customer invoices) - mirrors
-- 20260818100700_invoice_storage.sql exactly. public = false: nothing here
-- is reachable by a bare URL.
insert into storage.buckets (id, name, public)
values ('interpreter-invoices', 'interpreter-invoices', false)
on conflict (id) do nothing;

create policy "Admins can read interpreter invoice PDFs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'interpreter-invoices' and public.is_admin());

create policy "Admins can upload interpreter invoice PDFs"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'interpreter-invoices' and public.is_admin());

create policy "Admins can replace interpreter invoice PDFs"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'interpreter-invoices' and public.is_admin())
  with check (bucket_id = 'interpreter-invoices' and public.is_admin());

-- A plain EXISTS against interpreter_invoices is safe here for the same
-- reason it was safe for interpreter_invoice_items' own RLS policy (see
-- 20260819100000_interpreter_invoices.sql): interpreter_invoices already
-- grants the interpreter SELECT on their own non-draft rows, so this
-- doesn't hit the "fully admin-only referenced table" trap that required a
-- SECURITY DEFINER helper for the customer-invoice-PDF case. Written as one
-- anyway (is_my_interpreter_invoice_pdf()), matching that precedent's shape
-- exactly, for consistency and because a storage.objects USING clause
-- evaluating a subquery per-row benefits from being a single indexed
-- function call rather than an inline correlated subquery repeated by the
-- planner.
create or replace function public.is_my_interpreter_invoice_pdf(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.interpreter_invoices ii
    where ii.pdf_storage_path = p_object_name
      and ii.status <> 'draft'
      and ii.interpreter_id = public.current_interpreter_id()
  );
$$;

comment on function public.is_my_interpreter_invoice_pdf(text) is
  'True if the given Storage object name is the stored PDF path of one of the caller''s own, non-draft self-billing invoices. Mirrors is_my_customer_invoice_pdf().';

revoke all on function public.is_my_interpreter_invoice_pdf(text) from public;
grant execute on function public.is_my_interpreter_invoice_pdf(text) to authenticated;

create policy "Interpreters can read their own issued invoice PDFs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'interpreter-invoices' and public.is_my_interpreter_invoice_pdf(storage.objects.name));

comment on policy "Admins can read interpreter invoice PDFs" on storage.objects is
  'Customers (and any other authenticated-but-not-admin/not-this-interpreter account) get zero access to the interpreter-invoices bucket - same boundary as every interpreter_invoices table.';
