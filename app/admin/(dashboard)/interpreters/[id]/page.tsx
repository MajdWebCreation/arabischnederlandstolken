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
  approveInterpreterCredentials,
} from "@/app/admin/(dashboard)/interpreters/actions";
import { InterpreterForm } from "@/app/admin/(dashboard)/interpreters/interpreter-form";
import { AddLanguageForm } from "@/app/admin/(dashboard)/interpreters/[id]/add-language-form";
import {
  CapabilitiesSection,
  PortalAccountSection,
} from "@/app/admin/(dashboard)/interpreters/[id]/portal-forms";
import { languageLabel } from "@/lib/bookings/constants";
import { getInterpreterCapabilities, listCapabilityTags } from "@/lib/interpreters/matching";
import {
  getInterpreterCompleteness,
  isSelfBillingCurrentlyAccepted,
} from "@/lib/interpreters/completeness";
import { listInterpreterInvoicesForInterpreter } from "@/lib/interpreter-invoices/queries";
import {
  INTERPRETER_INVOICE_STATUS_LABELS,
  isInterpreterInvoiceStatus,
} from "@/lib/interpreter-invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

function AccountStatusRow({
  label,
  complete,
  trueLabel = "Compleet",
  falseLabel = "Incompleet",
  emphasize = false,
}: {
  label: string;
  complete: boolean;
  trueLabel?: string;
  falseLabel?: string;
  emphasize?: boolean;
}) {
  return (
    <div className={emphasize ? "rounded-xl border border-line bg-surface-alt/60 px-4 py-3" : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            complete
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <span aria-hidden>{complete ? "✓" : "○"}</span>
          {complete ? trueLabel : falseLabel}
        </span>
      </dd>
    </div>
  );
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
  const [interpreter, openBookingCount, allCapabilityTags, assignedCapabilities, interpreterInvoices] =
    await Promise.all([
      getInterpreterById(supabase, id),
      countOpenBookingsForInterpreter(supabase, id),
      listCapabilityTags(supabase),
      getInterpreterCapabilities(supabase, id),
      listInterpreterInvoicesForInterpreter(supabase, id),
    ]);

  if (!interpreter) {
    notFound();
  }

  const rbtvExpired = isRbtvExpired(interpreter.rbtv_expiry_date);
  const rbtvMissing = interpreter.sworn_interpreter && !interpreter.rbtv_number;
  const toggleActive = setInterpreterActive.bind(null, id, !interpreter.active);

  const completeness = getInterpreterCompleteness(
    interpreter,
    interpreter.interpreter_languages.length,
  );
  const profileComplete =
    completeness.sections.persoonsgegevens &&
    completeness.sections.tolkgegevens &&
    completeness.sections.zakelijk;
  const fiscalSettingsComplete = Boolean(interpreter.vat_treatment);
  const selfBillingAccepted = isSelfBillingCurrentlyAccepted(interpreter);
  const credentialsReviewPending =
    Boolean(interpreter.credentials_changed_at) &&
    (!interpreter.credentials_verified_at ||
      new Date(interpreter.credentials_changed_at!) > new Date(interpreter.credentials_verified_at));

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

      {credentialsReviewPending ? (
        <section className="panel border-amber-300 bg-amber-50 px-6 py-6">
          <h2 className="text-base font-semibold text-amber-900">Tolkgegevens gewijzigd</h2>
          <p className="mt-1 text-sm font-semibold text-amber-900">Controle vereist</p>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800">Beëdigd tolk</dt>
              <dd className="mt-1 text-sm text-amber-950">{interpreter.sworn_interpreter ? "Ja" : "Nee"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800">Rbtv-nummer</dt>
              <dd className="mt-1 text-sm text-amber-950">{interpreter.rbtv_number || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-amber-800">Geldig tot</dt>
              <dd className="mt-1 text-sm text-amber-950">{interpreter.rbtv_expiry_date || "—"}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-amber-800">
            Gewijzigd door de tolk zelf op{" "}
            {new Date(interpreter.credentials_changed_at!).toLocaleString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            . Deze wijziging telt nog niet mee voor opdrachten waarbij
            beëdiging vereist is totdat u dit goedkeurt.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={approveInterpreterCredentials.bind(null, id)}>
              <button type="submit" className="button-primary px-5 py-2.5">
                Goedkeuren
              </button>
            </form>
            <a href="#gegevens" className="button-secondary px-5 py-2.5">
              Afwijzen / corrigeren
            </a>
          </div>
        </section>
      ) : null}

      <section id="gegevens" className="panel px-6 py-6">
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
        <h2 className="text-base font-semibold text-foreground">Accountstatus</h2>
        <p className="mt-1 text-xs text-muted">
          Onboarding-voortgang zoals de tolk die zelf ziet op /tolk. Betaal-
          en fiscale gegevens zelf worden hier niet getoond - alleen of ze
          zijn ingevuld.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AccountStatusRow label="Profiel" complete={profileComplete} />
          <AccountStatusRow label="Betaalgegevens" complete={completeness.sections.betaalgegevens} />
          <AccountStatusRow label="Facturatie-instellingen" complete={fiscalSettingsComplete} />
          <AccountStatusRow
            label="Self-billing akkoord"
            complete={selfBillingAccepted}
            trueLabel="Ja"
            falseLabel="Nee"
          />
          <div className="sm:col-span-2">
            <AccountStatusRow
              label="Gereed voor uitbetaling"
              complete={completeness.paymentReady}
              trueLabel="Ja"
              falseLabel="Nee"
              emphasize
            />
          </div>
        </dl>
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
        <h2 className="text-base font-semibold text-foreground">Self-billing facturen</h2>
        <p className="mt-1 text-xs text-muted">
          Recente afrekeningen/facturen van deze tolk aan Arabisch Nederlands
          Tolken.
        </p>
        {interpreterInvoices.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nog geen afrekeningen.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {interpreterInvoices.slice(0, 10).map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/admin/interpreter-invoices/${invoice.id}`}
                    className="text-sm font-semibold text-brand-strong hover:underline"
                  >
                    {invoice.invoice_number ?? "Concept"}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatNumberAsCurrency(invoice.total_inc_vat)}
                  </p>
                </div>
                <span className="chip">
                  {isInterpreterInvoiceStatus(invoice.status)
                    ? INTERPRETER_INVOICE_STATUS_LABELS[invoice.status]
                    : invoice.status}
                </span>
              </li>
            ))}
          </ul>
        )}
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
