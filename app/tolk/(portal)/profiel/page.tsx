import { createClient } from "@/lib/supabase/server";
import { requireInterpreterLayoutSession } from "@/lib/auth/interpreter";
import { getInterpreterById } from "@/lib/interpreters/queries";
import { getInterpreterCapabilities, listCapabilityTags } from "@/lib/interpreters/matching";
import {
  getInterpreterCompleteness,
  getInterpreterMissingRequirements,
  isSelfBillingCurrentlyAccepted,
  type InterpreterCompletenessSection,
} from "@/lib/interpreters/completeness";
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
  updateMyCredentials,
  acceptSelfBillingAgreement,
} from "@/app/tolk/(portal)/profiel/actions";
import {
  AddMyLanguageForm,
  RemoveMyLanguageButton,
  MyCapabilityCheckbox,
} from "@/app/tolk/(portal)/profiel/tolkgegevens-forms";

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

/** "Nog nodig: X, Y" - the specific fields missing for one section, so the generic badge above is never the only feedback (brief section 11). */
function MissingList({
  section,
  missing,
}: {
  section: InterpreterCompletenessSection;
  missing: { section: InterpreterCompletenessSection; label: string }[];
}) {
  const labels = missing.filter((item) => item.section === section).map((item) => item.label);

  if (labels.length === 0) {
    return null;
  }

  return <p className="mt-1 text-xs text-amber-800">Nog nodig: {labels.join(", ")}.</p>;
}

function isCredentialsReviewPending(interpreter: {
  credentials_changed_at: string | null;
  credentials_verified_at: string | null;
}) {
  if (!interpreter.credentials_changed_at) return false;
  if (!interpreter.credentials_verified_at) return true;
  return new Date(interpreter.credentials_changed_at) > new Date(interpreter.credentials_verified_at);
}

export default async function InterpreterProfilePage() {
  const session = await requireInterpreterLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const supabase = await createClient();
  const [interpreter, capabilities, allCapabilityTags] = await Promise.all([
    getInterpreterById(supabase, session.interpreter.id),
    getInterpreterCapabilities(supabase, session.interpreter.id),
    listCapabilityTags(supabase),
  ]);

  if (!interpreter) {
    return null;
  }

  const missingRequirements = getInterpreterMissingRequirements(
    interpreter,
    interpreter.interpreter_languages.length,
  );
  const credentialsReviewPending = isCredentialsReviewPending(interpreter);

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
          Naam en e-mail worden door de beheerder onderhouden. Telefoon en
          stad kunt u zelf bijwerken.
        </p>
        <MissingList section="persoonsgegevens" missing={missingRequirements} />

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
        <MissingList section="tolkgegevens" missing={missingRequirements} />

        {credentialsReviewPending ? (
          <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Uw wijziging in beëdigde status/Rbtv-gegevens wordt nog door een
            beheerder gecontroleerd. Tot die tijd telt de wijziging niet mee
            voor opdrachten waarbij beëdiging vereist is.
          </p>
        ) : null}

        <div className="mt-4">
          <PortalActionForm action={updateMyCredentials} submitLabel="Opslaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    name="swornInterpreter"
                    defaultChecked={interpreter.sworn_interpreter}
                    className="h-4 w-4 rounded border-line-strong"
                  />
                  Beëdigd tolk
                </label>
              </div>
              <div>
                <label htmlFor="rbtvNumber" className={fieldLabel}>
                  Rbtv-nummer
                </label>
                <input
                  id="rbtvNumber"
                  name="rbtvNumber"
                  type="text"
                  dir="ltr"
                  defaultValue={interpreter.rbtv_number ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="rbtvExpiryDate" className={fieldLabel}>
                  Rbtv geldig tot
                </label>
                <input
                  id="rbtvExpiryDate"
                  name="rbtvExpiryDate"
                  type="date"
                  defaultValue={interpreter.rbtv_expiry_date ?? ""}
                  className="form-control mt-1.5"
                />
                {isRbtvExpired(interpreter.rbtv_expiry_date) ? (
                  <p className="mt-1 text-xs font-semibold text-red-700">Verlopen</p>
                ) : null}
              </div>
            </div>
          </PortalActionForm>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Taalcombinaties</h3>
          {interpreter.interpreter_languages.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nog geen talen geregistreerd.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {interpreter.interpreter_languages.map((language) => (
                <li key={language.id} className="flex items-center justify-between gap-2 text-sm text-foreground">
                  <span>
                    {languageLabel(language.language_from)} → {languageLabel(language.language_to)}
                    {language.sworn_for_combination ? (
                      <span className="ms-2 chip">Beëdigd</span>
                    ) : null}
                  </span>
                  <RemoveMyLanguageButton languageId={language.id} />
                </li>
              ))}
            </ul>
          )}
          <AddMyLanguageForm />
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Dialecten</h3>
          <p className="mt-1 text-xs text-muted">Optioneel.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {allCapabilityTags
              .filter((tag) => tag.category === "dialect" && tag.active)
              .map((tag) => (
                <MyCapabilityCheckbox
                  key={tag.id}
                  tag={tag}
                  checked={dialects.some((c) => c.capability_tag_id === tag.id)}
                />
              ))}
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Specialisaties</h3>
          <p className="mt-1 text-xs text-muted">Optioneel.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {allCapabilityTags
              .filter((tag) => tag.category === "specialty" && tag.active)
              .map((tag) => (
                <MyCapabilityCheckbox
                  key={tag.id}
                  tag={tag}
                  checked={specialties.some((c) => c.capability_tag_id === tag.id)}
                />
              ))}
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Zakelijke gegevens</h2>
          <SectionBadge done={completeness.sections.zakelijk} />
        </div>
        <MissingList section="zakelijk" missing={missingRequirements} />
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
        <MissingList section="betaalgegevens" missing={missingRequirements} />
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
        <MissingList section="facturatie" missing={missingRequirements} />
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
          {isSelfBillingCurrentlyAccepted(interpreter) ? (
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Akkoord gegeven op{" "}
              {new Date(interpreter.self_billing_accepted_at!).toLocaleDateString("nl-NL")}{" "}
              (versie {interpreter.self_billing_terms_version}).
            </p>
          ) : (
            <>
              {interpreter.self_billing_accepted_at ? (
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  De self-billingvoorwaarden zijn gewijzigd sinds uw laatste
                  akkoord (versie {interpreter.self_billing_terms_version}).
                  U moet de huidige voorwaarden opnieuw accepteren voordat er
                  nieuwe officiële facturen kunnen worden uitgegeven.
                </p>
              ) : null}
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}
