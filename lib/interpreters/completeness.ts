import type { Database } from "@/lib/supabase/database.types";
import { CURRENT_SELF_BILLING_TERMS_VERSION } from "@/lib/legal/terms";

type InterpreterRow = Database["public"]["Tables"]["interpreters"]["Row"];

/**
 * Everything the completeness check reads, as a Pick rather than the full
 * row - keeps this module honest about exactly which columns drive
 * onboarding state, and lets any caller (the /tolk dashboard, the profile
 * page, the admin detail page) pass whichever already-fetched row shape it
 * has without an extra query.
 */
export type InterpreterForCompleteness = Pick<
  InterpreterRow,
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "sworn_interpreter"
  | "rbtv_number"
  | "rbtv_expiry_date"
  | "legal_business_name"
  | "business_street"
  | "business_house_number"
  | "business_postal_code"
  | "business_city"
  | "iban"
  | "account_holder_name"
  | "vat_treatment"
  | "self_billing_accepted_at"
  | "self_billing_terms_version"
>;

export type InterpreterCompletenessSection =
  | "persoonsgegevens"
  | "tolkgegevens"
  | "zakelijk"
  | "betaalgegevens"
  | "facturatie";

export const INTERPRETER_COMPLETENESS_SECTION_LABELS: Record<InterpreterCompletenessSection, string> = {
  persoonsgegevens: "Persoonsgegevens",
  tolkgegevens: "Tolkgegevens",
  zakelijk: "Zakelijke gegevens",
  betaalgegevens: "Betaalgegevens",
  facturatie: "Facturatie",
};

export type InterpreterCompleteness = {
  sections: Record<InterpreterCompletenessSection, boolean>;
  completedSections: number;
  totalSections: number;
  percentage: number;
  /** True once every onboarding section is done - the "Account compleet" success state replaces the onboarding card at this point. */
  isComplete: boolean;
  /**
   * Derived, never stored (see the Phase 4 brief: "do not store duplicated
   * truth if a server-side derived helper is enough") - true only once the
   * business/payment/fiscal information actually needed for settlement
   * exists, regardless of persoonsgegevens/tolkgegevens (which matter for
   * being assignable to work, not for being payable for it).
   */
  paymentReady: boolean;
};

const nonBlank = (value: string | null | undefined) => Boolean(value?.trim());

/**
 * True only when the interpreter has accepted self-billing *and* that
 * acceptance is of the currently-effective agreement text - never just
 * "accepted at some point" (see brief section 12: consent to an old,
 * materially different version must never be silently treated as consent
 * to a new one). The same check the workflow RPCs perform independently in
 * SQL (submit_interpreter_settlement_for_review/issue_interpreter_invoice,
 * see 20260820100100_self_billing_terms_version_check.sql) - this is the
 * TypeScript-side mirror used for display/completeness, not the
 * authorization boundary itself.
 */
export function isSelfBillingCurrentlyAccepted(
  interpreter: Pick<InterpreterForCompleteness, "self_billing_accepted_at" | "self_billing_terms_version">,
): boolean {
  return (
    Boolean(interpreter.self_billing_accepted_at) &&
    interpreter.self_billing_terms_version === CURRENT_SELF_BILLING_TERMS_VERSION
  );
}

/**
 * Pure, side-effect-free - no database access, safe to call from a Server
 * Component or a Server Action alike. languageCount is passed in rather
 * than read from a nested relation here, so this module has no opinion on
 * how the caller fetched it (an embedded interpreter_languages array's
 * .length, or a separate count query).
 */
export function getInterpreterCompleteness(
  interpreter: InterpreterForCompleteness,
  languageCount: number,
): InterpreterCompleteness {
  const persoonsgegevens =
    nonBlank(interpreter.first_name) &&
    nonBlank(interpreter.last_name) &&
    nonBlank(interpreter.email) &&
    nonBlank(interpreter.phone);

  const tolkgegevens =
    languageCount > 0 &&
    (!interpreter.sworn_interpreter ||
      (nonBlank(interpreter.rbtv_number) && Boolean(interpreter.rbtv_expiry_date)));

  const zakelijk =
    nonBlank(interpreter.legal_business_name) &&
    nonBlank(interpreter.business_street) &&
    nonBlank(interpreter.business_house_number) &&
    nonBlank(interpreter.business_postal_code) &&
    nonBlank(interpreter.business_city);

  const betaalgegevens = nonBlank(interpreter.iban) && nonBlank(interpreter.account_holder_name);

  const facturatie = Boolean(interpreter.vat_treatment) && isSelfBillingCurrentlyAccepted(interpreter);

  const sections: Record<InterpreterCompletenessSection, boolean> = {
    persoonsgegevens,
    tolkgegevens,
    zakelijk,
    betaalgegevens,
    facturatie,
  };

  const values = Object.values(sections);
  const completedSections = values.filter(Boolean).length;
  const totalSections = values.length;

  return {
    sections,
    completedSections,
    totalSections,
    percentage: Math.round((completedSections / totalSections) * 100),
    isComplete: completedSections === totalSections,
    paymentReady: zakelijk && betaalgegevens && facturatie,
  };
}

export type MissingRequirement = {
  section: InterpreterCompletenessSection;
  label: string;
};

/**
 * The specific field(s) missing per incomplete section, so the UI can say
 * e.g. "Nog nodig: Rbtv geldig tot" instead of only a generic incomplete
 * badge (brief section 11) - and so the settlement-readiness blocker on the
 * booking/interpreter-invoice admin pages can list exactly what's missing
 * (brief section 3) instead of a vague "profile incomplete". Deliberately
 * never requires dialects/specialisations - those stay optional regardless
 * of business policy elsewhere, matching getInterpreterCompleteness's own
 * tolkgegevens rule, which never reads them either.
 */
export function getInterpreterMissingRequirements(
  interpreter: InterpreterForCompleteness,
  languageCount: number,
): MissingRequirement[] {
  const missing: MissingRequirement[] = [];

  if (!nonBlank(interpreter.first_name)) missing.push({ section: "persoonsgegevens", label: "Voornaam" });
  if (!nonBlank(interpreter.last_name)) missing.push({ section: "persoonsgegevens", label: "Achternaam" });
  if (!nonBlank(interpreter.email)) missing.push({ section: "persoonsgegevens", label: "E-mailadres" });
  if (!nonBlank(interpreter.phone)) missing.push({ section: "persoonsgegevens", label: "Telefoonnummer" });

  if (languageCount === 0) {
    missing.push({ section: "tolkgegevens", label: "Ten minste één taalcombinatie" });
  }
  if (interpreter.sworn_interpreter) {
    if (!nonBlank(interpreter.rbtv_number)) missing.push({ section: "tolkgegevens", label: "Rbtv-nummer" });
    if (!interpreter.rbtv_expiry_date) missing.push({ section: "tolkgegevens", label: "Rbtv geldig tot" });
  }

  if (!nonBlank(interpreter.legal_business_name)) missing.push({ section: "zakelijk", label: "Bedrijfsnaam" });
  if (!nonBlank(interpreter.business_street)) missing.push({ section: "zakelijk", label: "Straat" });
  if (!nonBlank(interpreter.business_house_number)) missing.push({ section: "zakelijk", label: "Huisnummer" });
  if (!nonBlank(interpreter.business_postal_code)) missing.push({ section: "zakelijk", label: "Postcode" });
  if (!nonBlank(interpreter.business_city)) missing.push({ section: "zakelijk", label: "Plaats" });

  if (!nonBlank(interpreter.iban)) missing.push({ section: "betaalgegevens", label: "IBAN" });
  if (!nonBlank(interpreter.account_holder_name)) {
    missing.push({ section: "betaalgegevens", label: "Naam rekeninghouder" });
  }

  if (!interpreter.vat_treatment) missing.push({ section: "facturatie", label: "Fiscale status (btw)" });
  if (!isSelfBillingCurrentlyAccepted(interpreter)) {
    missing.push({
      section: "facturatie",
      label: interpreter.self_billing_accepted_at
        ? "Self-billing akkoord (huidige versie)"
        : "Self-billing akkoord",
    });
  }

  return missing;
}
