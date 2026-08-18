import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getInterpreterById,
  countOpenBookingsForInterpreter,
} from "@/lib/interpreters/queries";
import {
  removeInterpreterLanguage,
  setInterpreterActive,
  updateInterpreter,
} from "@/app/admin/(dashboard)/interpreters/actions";
import { InterpreterForm } from "@/app/admin/(dashboard)/interpreters/interpreter-form";
import { AddLanguageForm } from "@/app/admin/(dashboard)/interpreters/[id]/add-language-form";
import {
  CapabilitiesSection,
  PortalAccountSection,
} from "@/app/admin/(dashboard)/interpreters/[id]/portal-forms";
import { languageLabel } from "@/lib/bookings/constants";
import { getInterpreterCapabilities, listCapabilityTags } from "@/lib/interpreters/matching";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

export default async function InterpreterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const [interpreter, openBookingCount, allCapabilityTags, assignedCapabilities] =
    await Promise.all([
      getInterpreterById(supabase, id),
      countOpenBookingsForInterpreter(supabase, id),
      listCapabilityTags(supabase),
      getInterpreterCapabilities(supabase, id),
    ]);

  if (!interpreter) {
    notFound();
  }

  const rbtvExpired = isRbtvExpired(interpreter.rbtv_expiry_date);
  const rbtvMissing = interpreter.sworn_interpreter && !interpreter.rbtv_number;
  const toggleActive = setInterpreterActive.bind(null, id, !interpreter.active);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/interpreters"
            className="text-sm font-medium text-muted hover:text-brand-strong"
          >
            ← Tolken
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {interpreter.first_name} {interpreter.last_name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {interpreter.active ? (
              <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                Actief
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                Inactief
              </span>
            )}
            {rbtvMissing ? (
              <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                Rbtv-nummer ontbreekt
              </span>
            ) : rbtvExpired ? (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
                Rbtv verlopen
              </span>
            ) : null}
          </div>
        </div>

        <form action={toggleActive}>
          {interpreter.active && openBookingCount > 0 ? (
            <p className="mb-2 max-w-xs text-right text-xs text-amber-800">
              Let op: {openBookingCount} open boeking(en) bij deze tolk.
            </p>
          ) : null}
          <button
            type="submit"
            className={interpreter.active ? "button-secondary px-5 py-2.5" : "button-primary px-5 py-2.5"}
          >
            {interpreter.active ? "Deactiveren" : "Activeren"}
          </button>
        </form>
      </div>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Gegevens</h2>
        <div className="mt-4">
          <InterpreterForm
            action={updateInterpreter.bind(null, id)}
            interpreter={interpreter}
            submitLabel="Wijzigingen opslaan"
          />
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">
          Taalcombinaties
        </h2>

        {interpreter.interpreter_languages.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nog geen talen geregistreerd.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {interpreter.interpreter_languages.map((language) => (
              <li
                key={language.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {languageLabel(language.language_from)} →{" "}
                    {languageLabel(language.language_to)}
                  </span>
                  {language.sworn_for_combination ? (
                    <span className="ms-2 chip">Beëdigd</span>
                  ) : null}
                  {language.notes ? (
                    <p className="mt-0.5 text-xs text-muted">{language.notes}</p>
                  ) : null}
                </div>
                <form
                  action={removeInterpreterLanguage.bind(null, id, language.id)}
                >
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Verwijderen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddLanguageForm interpreterId={id} />
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">
          Dialecten en specialisaties
        </h2>
        <p className="mt-1 text-xs text-muted">
          Wordt gebruikt om geschikte tolken te tonen bij het werven voor een
          boeking. Alleen door de beheerder in te stellen.
        </p>
        <div className="mt-4">
          <CapabilitiesSection
            interpreterId={id}
            allTags={allCapabilityTags}
            assigned={assignedCapabilities}
          />
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Portaalaccount</h2>
        <p className="mt-1 text-xs text-muted">
          Met een gekoppeld account kan deze tolk inloggen op{" "}
          <span className="font-mono">/tolk</span> om opdrachten te bekijken
          en erop te reageren.
        </p>
        <div className="mt-4">
          <PortalAccountSection interpreter={interpreter} />
        </div>
      </section>
    </div>
  );
}
