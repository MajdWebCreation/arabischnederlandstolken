import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listInterpreters } from "@/lib/interpreters/queries";
import { languageLabel } from "@/lib/bookings/constants";

export const dynamic = "force-dynamic";

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

export default async function AdminInterpretersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const interpreters = await listInterpreters(supabase, { search: q });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow eyebrow-muted">Beheer</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Tolken
          </h1>
          <p className="mt-1 text-sm text-muted">{interpreters.length} in de directory</p>
        </div>
        <Link href="/admin/interpreters/new" className="button-primary px-5 py-2.5">
          Tolk toevoegen
        </Link>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Zoek op naam, e-mail, stad of Rbtv-nummer"
          className="form-control max-w-md"
        />
        <button type="submit" className="button-secondary px-5 py-2.5">
          Zoeken
        </button>
      </form>

      {interpreters.length === 0 ? (
        <p className="panel-soft px-5 py-8 text-center text-sm text-muted">
          Geen tolken gevonden.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Stad</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Talen</th>
                <th className="px-4 py-3">Beëdigd</th>
                <th className="px-4 py-3">Rbtv</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {interpreters.map((interpreter) => {
                const rbtvExpired = isRbtvExpired(interpreter.rbtv_expiry_date);
                const rbtvMissing = interpreter.sworn_interpreter && !interpreter.rbtv_number;

                return (
                  <tr
                    key={interpreter.id}
                    className="border-b border-line last:border-0 hover:bg-surface-alt/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/interpreters/${interpreter.id}`}
                        className="font-semibold text-brand-strong hover:underline"
                      >
                        {interpreter.first_name} {interpreter.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{interpreter.city || "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      <div>{interpreter.email}</div>
                      {interpreter.phone ? <div>{interpreter.phone}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {interpreter.interpreter_languages.length > 0
                        ? interpreter.interpreter_languages
                            .map(
                              (l) =>
                                `${languageLabel(l.language_from)}→${languageLabel(l.language_to)}`,
                            )
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {interpreter.sworn_interpreter ? (
                        <span className="chip">Ja</span>
                      ) : (
                        <span className="text-muted">Nee</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rbtvMissing ? (
                        <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                          Ontbreekt
                        </span>
                      ) : rbtvExpired ? (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
                          Verlopen
                        </span>
                      ) : interpreter.rbtv_number ? (
                        <span className="text-muted">{interpreter.rbtv_number}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {interpreter.active ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                          Actief
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          Inactief
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
