import { createClient } from "@/lib/supabase/server";
import { listCapabilityTags, type CapabilityTagRow } from "@/lib/interpreters/matching";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { createCapabilityTag, setCapabilityTagActive } from "@/app/admin/(dashboard)/capabilities/actions";

export const dynamic = "force-dynamic";

function TagList({ items }: { items: CapabilityTagRow[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nog niets toegevoegd.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((tag) => (
        <li key={tag.id} className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <span className="text-sm font-medium text-foreground">{tag.label}</span>
            <span className="ms-2 font-mono text-xs text-muted">{tag.code}</span>
          </div>
          <form action={setCapabilityTagActive.bind(null, tag.id, !tag.active)}>
            <button
              type="submit"
              className={
                tag.active
                  ? "text-xs font-semibold text-muted-strong hover:text-red-700"
                  : "text-xs font-semibold text-emerald-700 hover:underline"
              }
            >
              {tag.active ? "Deactiveren" : "Activeren"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default async function CapabilitiesPage() {
  const supabase = await createClient();
  const tags = await listCapabilityTags(supabase);
  const dialects = tags.filter((tag) => tag.category === "dialect");
  const specialties = tags.filter((tag) => tag.category === "specialty");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Beheer</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Dialecten en specialisaties
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          De lijst waaruit tolken hun dialecten en specialisaties krijgen
          toegewezen (op het tolkprofiel) en waarop boekingen gematcht worden.
          Uitbreidbaar - dit is geen vaste lijst.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Dialecten</h2>
          <div className="mt-3">
            <TagList items={dialects} />
          </div>
        </section>
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Specialisaties</h2>
          <div className="mt-3">
            <TagList items={specialties} />
          </div>
        </section>
      </div>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Nieuwe toevoegen</h2>
        <div className="mt-4">
          <AdminActionForm action={createCapabilityTag} submitLabel="Toevoegen">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Categorie
                </label>
                <select id="category" name="category" className="form-control mt-1.5">
                  <option value="dialect">Dialect</option>
                  <option value="specialty">Specialisatie</option>
                </select>
              </div>
              <div>
                <label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  dir="ltr"
                  placeholder="bijv. egyptian"
                  required
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="label" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Naam
                </label>
                <input
                  id="label"
                  name="label"
                  type="text"
                  placeholder="bijv. Egyptisch Arabisch"
                  required
                  className="form-control mt-1.5"
                />
              </div>
            </div>
          </AdminActionForm>
        </div>
      </section>
    </div>
  );
}
