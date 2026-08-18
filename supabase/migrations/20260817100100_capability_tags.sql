-- Dialects and specialties: a maintainable, extensible capability catalog.
--
-- The specific dialect/specialty names are deliberately not hardcoded as an
-- enum or CHECK list - they're ordinary rows admin can add to over time.
-- Only the two top-level categories are constrained, since that grouping is
-- what the UI and matching logic key off; a genuinely new category is a
-- one-line migration, far cheaper than the values list would be if it were
-- hardcoded.
create table public.capability_tags (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('dialect', 'specialty')),
  code text not null check (btrim(code) <> ''),
  label text not null check (btrim(label) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category, code)
);

comment on table public.capability_tags is
  'Extensible catalog of interpreter capabilities (dialects, specialties). Admin-managed; new values are added as rows, not migrations.';

alter table public.capability_tags enable row level security;

-- No sensitive data here - just a small reference/lookup table both admin
-- and interpreters need to read (admin to assign tags, interpreters to see
-- their own assigned tags' labels on their profile). No delete grant:
-- deactivate a tag (active = false) instead, the same "don't delete
-- historically-referenced rows" rule already applied to interpreters.
revoke all on public.capability_tags from anon;
grant select, insert, update on public.capability_tags to authenticated;

create policy "Authenticated users can read capability tags"
  on public.capability_tags
  for select
  to authenticated
  using (true);

create policy "Admins manage capability tags"
  on public.capability_tags
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Which interpreter has which capability. Admin-assigned only - an
-- interpreter can read their own rows (for their profile page) but never
-- write here, matching "an interpreter must not be able to self-declare
-- sworn qualifications" extended to dialects/specialties.
create table public.interpreter_capabilities (
  id uuid primary key default gen_random_uuid(),
  interpreter_id uuid not null references public.interpreters (id) on delete cascade,
  capability_tag_id uuid not null references public.capability_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (interpreter_id, capability_tag_id)
);

comment on table public.interpreter_capabilities is
  'Links an interpreter to a dialect/specialty capability tag. Admin-assigned only.';

create index interpreter_capabilities_interpreter_id_idx on public.interpreter_capabilities (interpreter_id);
create index interpreter_capabilities_tag_id_idx on public.interpreter_capabilities (capability_tag_id);

alter table public.interpreter_capabilities enable row level security;

revoke all on public.interpreter_capabilities from anon, authenticated;
grant select, insert, delete on public.interpreter_capabilities to authenticated;

create policy "Admins manage interpreter capabilities"
  on public.interpreter_capabilities
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Interpreters can read their own capabilities"
  on public.interpreter_capabilities
  for select
  to authenticated
  using (interpreter_id = public.current_interpreter_id());

-- Seed the starter catalog named in the brief. Admin can add more from the
-- admin UI at any time; this is a starting point, not a fixed list.
insert into public.capability_tags (category, code, label) values
  ('dialect', 'syrian', 'Syrisch Arabisch'),
  ('dialect', 'lebanese', 'Libanees Arabisch'),
  ('dialect', 'levantine', 'Levantijns Arabisch'),
  ('dialect', 'iraqi', 'Iraaks Arabisch'),
  ('dialect', 'gulf', 'Golf-Arabisch'),
  ('specialty', 'healthcare', 'Zorg'),
  ('specialty', 'mental_health', 'GGZ / geestelijke gezondheidszorg'),
  ('specialty', 'legal', 'Juridisch'),
  ('specialty', 'court', 'Rechtbank'),
  ('specialty', 'municipality', 'Gemeente'),
  ('specialty', 'migration', 'Migratie / IND'),
  ('specialty', 'business', 'Zakelijk')
on conflict (category, code) do nothing;
