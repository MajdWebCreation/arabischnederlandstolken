-- Private Storage bucket for issued invoice PDFs. The first Storage bucket
-- in this project - see the RLS reasoning below, which follows the same
-- "no service role key anywhere" principle as every table in this app.
--
-- public = false: nothing here is reachable by a bare URL. storage.objects
-- already has Row Level Security enabled by default with zero policies
-- (i.e. fully denied for both anon and authenticated) until policies are
-- added, so the policies below are strictly additive - there is no
-- existing broad grant to narrow.
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "Admins can read invoice PDFs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'invoices' and public.is_admin());

create policy "Admins can upload invoice PDFs"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'invoices' and public.is_admin());

create policy "Admins can replace invoice PDFs"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'invoices' and public.is_admin())
  with check (bucket_id = 'invoices' and public.is_admin());

comment on policy "Admins can read invoice PDFs" on storage.objects is
  'Interpreters (authenticated but not is_admin()) get zero access to the invoices bucket - same boundary as every invoice table.';
