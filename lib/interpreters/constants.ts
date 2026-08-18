export const INTERPRETER_VAT_TREATMENTS = ["standard_vat", "kor", "no_vat", "other"] as const;
export type InterpreterVatTreatment = (typeof INTERPRETER_VAT_TREATMENTS)[number];

export const INTERPRETER_VAT_TREATMENT_LABELS: Record<InterpreterVatTreatment, string> = {
  standard_vat: "Reguliere btw-plicht",
  kor: "Kleineondernemersregeling (KOR)",
  no_vat: "Geen btw-plicht",
  other: "Anders",
};

export function isInterpreterVatTreatment(value: string): value is InterpreterVatTreatment {
  return (INTERPRETER_VAT_TREATMENTS as readonly string[]).includes(value);
}
