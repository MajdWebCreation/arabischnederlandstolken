import type { Database } from "@/lib/supabase/database.types";

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

  const facturatie = Boolean(interpreter.vat_treatment) && Boolean(interpreter.self_billing_accepted_at);

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
