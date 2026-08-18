import { createClient } from "@/lib/supabase/server";
import { requireInterpreterLayoutSession } from "@/lib/auth/interpreter";
import { getInterpreterById } from "@/lib/interpreters/queries";
import { getInterpreterCapabilities } from "@/lib/interpreters/matching";
import { getInterpreterCompleteness } from "@/lib/interpreters/completeness";
import {
  INTERPRETER_VAT_TREATMENTS,
  INTERPRETER_VAT_TREATMENT_LABELS,
  type InterpreterVatTreatment,
} from "@/lib/interpreters/constants";
import { languageLabel } from "@/lib/bookings/constants";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import { SELF_BILLING_AGREEMENT_SUMMARY, TERMS_PATH } from "@/lib/legal/terms";
import {
  updateMyContactDetails,
  updateMyBusinessDetails,
  updateMyPaymentDetails,
  updateMyFiscalDetails,
  acceptSelfBillingAgreement,
} from "@/app/tolk/(portal)/profiel/actions";

export const dynamic = "force-dynamic";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

function SectionBadge({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        done
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-line bg-surface-alt text-muted-strong"
      }`}
    >
      <span aria-hidden>{done ? "✓" : "○"}</span>
      {done ? "Compleet" : "Nog niet compleet"}
    </span>
  );
}

export default async function InterpreterProfilePage() {
  const session = await requireInterpreterLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const supabase = await createClient();
  const [interpreter, capabilities] = await Promise.all([
    getInterpreterById(supabase, session.interpreter.id),
    getInterpreterCapabilities(supabase, session.interpreter.id),
  ]);

  if (!interpreter) {
    return null;
  }

  const completeness = getInterpreterCompleteness(
    interpreter,
    interpreter.interpreter_languages.length,
  );

  const dialects = capabilities.filter((c) => c.capability_tags?.category === "dialect");
  const specialties = capabilities.filter((c) => c.capability_tags?.category === "specialty");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Tolkenportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {interpreter.first_name} {interpreter.last_name}
        </h1>
      </div>

      {completeness.isComplete ? (
        <div className="content-card border-emerald-300 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-900">Account compleet</p>
          <p className="mt-0.5 text-sm text-emerald-800">Gereed voor uitbetaling.</p>
        </div>
      ) : (
        <div className="content-card border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm leading-6 text-amber-900">
            {completeness.paymentReady
              ? "Bijna klaar - vul de resterende gegevens hieronder aan."
              : "Je account is nog niet gereed voor uitbetaling. Vul eerst je zakelijke en betaalgegevens aan."}
          </p>
        </div>
      )}

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Persoonsgegevens</h2>
          <SectionBadge done={completeness.sections.persoonsgegevens} />
        </div>
        <p className="mt-1 text-xs text-muted">
          Naam, e-mail en kwalificaties worden door de beheerder onderhouden.
          Telefoon en stad kunt u zelf bijwerken.
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={fieldLabel}>E-mailadres</dt>
            <dd className="mt-1 text-sm text-foreground">{interpreter.email}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-line pt-5">
          <PortalActionForm action={updateMyContactDetails} submitLabel="Opslaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className={fieldLabel}>
                  Telefoon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  dir="ltr"
                  defaultValue={interpreter.phone ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="city" className={fieldLabel}>
                  Stad
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={interpreter.city ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
            </div>
          </PortalActionForm>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Tolkgegevens</h2>
          <SectionBadge done={completeness.sections.tolkgegevens} />
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={fieldLabel}>Beëdigd tolk</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.sworn_interpreter ? "Ja" : "Nee"}
            </dd>
          </div>
          <div>
            <dt className={fieldLabel}>Rbtv-nummer</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.rbtv_number || "Niet geregistreerd"}
            </dd>
          </div>
          <div>
            <dt className={fieldLabel}>Rbtv geldig tot</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.rbtv_expiry_date || "Onbekend"}
              {isRbtvExpired(interpreter.rbtv_expiry_date) ? (
                <span className="ms-2 text-xs font-semibold text-red-700">Verlopen</span>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Taalcombinaties</h3>
          {interpreter.interpreter_languages.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nog geen talen geregistreerd.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {interpreter.interpreter_languages.map((language) => (
                <li key={language.id} className="text-sm text-foreground">
                  {languageLabel(language.language_from)} → {languageLabel(language.language_to)}
                  {language.sworn_for_combination ? (
                    <span className="ms-2 chip">Beëdigd</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Dialecten</h3>
          {dialects.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Geen dialecten geregistreerd.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-2">
              {dialects.map((c) => (
                <span key={c.id} className="chip">
                  {c.capability_tags?.label}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Specialisaties</h3>
          {specialties.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Geen specialisaties geregistreerd.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-2">
              {specialties.map((c) => (
                <span key={c.id} className="chip">
                  {c.capability_tags?.label}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Zakelijke gegevens</h2>
          <SectionBadge done={completeness.sections.zakelijk} />
        </div>
        <p className="mt-1 text-xs text-muted">
          Nodig om facturen namens u op te kunnen stellen. KVK-nummer en
          btw-id zijn optioneel als deze niet van toepassing zijn.
        </p>

        <div className="mt-4">
          <PortalActionForm action={updateMyBusinessDetails} submitLabel="Opslaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="legalBusinessName" className={fieldLabel}>
                  Bedrijfsnaam
                </label>
                <input
                  id="legalBusinessName"
                  name="legalBusinessName"
                  type="text"
                  defaultValue={interpreter.legal_business_name ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="tradeName" className={fieldLabel}>
                  Handelsnaam <span className="font-normal normal-case text-muted">(optioneel)</span>
                </label>
                <input
                  id="tradeName"
                  name="tradeName"
                  type="text"
                  defaultValue={interpreter.trade_name ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="businessStreet" className={fieldLabel}>
                  Straat
                </label>
                <input
                  id="businessStreet"
                  name="businessStreet"
                  type="text"
                  defaultValue={interpreter.business_street ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="businessHouseNumber" className={fieldLabel}>
                  Huisnummer
                </label>
                <input
                  id="businessHouseNumber"
                  name="businessHouseNumber"
                  type="text"
                  defaultValue={interpreter.business_house_number ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="businessHouseNumberAddition" className={fieldLabel}>
                  Toevoeging <span className="font-normal normal-case text-muted">(optioneel)</span>
                </label>
                <input
                  id="businessHouseNumberAddition"
                  name="businessHouseNumberAddition"
                  type="text"
                  defaultValue={interpreter.business_house_number_addition ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="businessPostalCode" className={fieldLabel}>
                  Postcode
                </label>
                <input
                  id="businessPostalCode"
                  name="businessPostalCode"
                  type="text"
                  defaultValue={interpreter.business_postal_code ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="businessCity" className={fieldLabel}>
                  Plaats
                </label>
                <input
                  id="businessCity"
                  name="businessCity"
                  type="text"
                  defaultValue={interpreter.business_city ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="kvkNumber" className={fieldLabel}>
                  KVK-nummer <span className="font-normal normal-case text-muted">(optioneel)</span>
                </label>
                <input
                  id="kvkNumber"
                  name="kvkNumber"
                  type="text"
                  dir="ltr"
                  defaultValue={interpreter.kvk_number ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="vatId" className={fieldLabel}>
                  Btw-id <span className="font-normal normal-case text-muted">(optioneel)</span>
                </label>
                <input
                  id="vatId"
                  name="vatId"
                  type="text"
                  dir="ltr"
                  defaultValue={interpreter.vat_id ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
            </div>
          </PortalActionForm>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Betaalgegevens</h2>
          <SectionBadge done={completeness.sections.betaalgegevens} />
        </div>
        <p className="mt-1 text-xs text-muted">
          Het IBAN waarnaar uitbetalingen worden overgemaakt.
        </p>

        <div className="mt-4">
          <PortalActionForm action={updateMyPaymentDetails} submitLabel="Opslaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="iban" className={fieldLabel}>
                  IBAN
                </label>
                <input
                  id="iban"
                  name="iban"
                  type="text"
                  dir="ltr"
                  defaultValue={interpreter.iban ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="accountHolderName" className={fieldLabel}>
                  Naam rekeninghouder
                </label>
                <input
                  id="accountHolderName"
                  name="accountHolderName"
                  type="text"
                  defaultValue={interpreter.account_holder_name ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
            </div>
          </PortalActionForm>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Facturatie</h2>
          <SectionBadge done={completeness.sections.facturatie} />
        </div>
        <p className="mt-1 text-xs text-muted">
          Uw btw-status wordt door uzelf opgegeven en nooit automatisch
          afgeleid.
        </p>

        <div className="mt-4">
          <PortalActionForm action={updateMyFiscalDetails} submitLabel="Btw-status opslaan">
            <label htmlFor="vatTreatment" className={fieldLabel}>
              Btw-status
            </label>
            <select
              id="vatTreatment"
              name="vatTreatment"
              defaultValue={interpreter.vat_treatment ?? ""}
              className="form-control mt-1.5"
            >
              <option value="">Nog niet gekozen</option>
              {INTERPRETER_VAT_TREATMENTS.map((value) => (
                <option key={value} value={value}>
                  {INTERPRETER_VAT_TREATMENT_LABELS[value as InterpreterVatTreatment]}
                </option>
              ))}
            </select>
          </PortalActionForm>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-sm font-semibold text-foreground">Self-billing</h3>
          {interpreter.self_billing_accepted_at ? (
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Akkoord gegeven op{" "}
              {new Date(interpreter.self_billing_accepted_at).toLocaleDateString("nl-NL")}{" "}
              (versie {interpreter.self_billing_terms_version}).
            </p>
          ) : (
            <PortalActionForm
              action={acceptSelfBillingAgreement}
              submitLabel="Akkoord en activeren"
              submitClassName="button-primary mt-3 px-5 py-3 disabled:cursor-wait disabled:opacity-65"
            >
              <label className="flex items-start gap-2.5 rounded-xl border border-line px-3.5 py-3 text-sm leading-6 has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
                <input
                  type="checkbox"
                  name="agree"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong"
                />
                {SELF_BILLING_AGREEMENT_SUMMARY} Zie ook de{" "}
                <a href={TERMS_PATH} target="_blank" className="font-semibold underline">
                  Algemene Voorwaarden
                </a>
                .
              </label>
            </PortalActionForm>
          )}
        </div>
      </section>
    </div>
  );
}
