export const INTERPRETER_INVOICE_STATUSES = [
  "draft",
  "pending_review",
  "change_requested",
  "approved",
  "issued",
  "paid",
  "cancelled",
] as const;
export type InterpreterInvoiceStatus = (typeof INTERPRETER_INVOICE_STATUSES)[number];

/** Admin-facing labels - "Concept" (draft) is never shown to the interpreter at all, see my_interpreter_invoices. */
export const INTERPRETER_INVOICE_STATUS_LABELS: Record<InterpreterInvoiceStatus, string> = {
  draft: "Concept",
  pending_review: "Te controleren",
  change_requested: "Wijziging aangevraagd",
  approved: "Akkoord",
  issued: "Definitief",
  paid: "Betaald",
  cancelled: "Geannuleerd",
};

export function isInterpreterInvoiceStatus(value: string): value is InterpreterInvoiceStatus {
  return (INTERPRETER_INVOICE_STATUSES as readonly string[]).includes(value);
}

/** Financial/identity fields are only editable while status is draft or change_requested - see enforce_interpreter_invoice_immutability(). */
export function isInterpreterInvoiceEditable(status: string): boolean {
  return status === "draft" || status === "change_requested";
}

export const INTERPRETER_INVOICE_EVENT_TYPE_LABELS: Record<string, string> = {
  settlement_created: "Afrekening aangemaakt",
  submitted_for_review: "Naar tolk gestuurd",
  interpreter_approved: "Tolk akkoord",
  change_requested: "Wijziging aangevraagd door tolk",
  issued: "Factuur definitief gemaakt",
  marked_paid: "Gemarkeerd als betaald",
  cancelled: "Geannuleerd",
};

/** Server-side error codes raised by the workflow RPCs, mapped to admin-facing Dutch messages. */
export const INTERPRETER_INVOICE_ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "Niet geautoriseerd.",
  settlement_not_found: "Afrekening niet gevonden.",
  settlement_not_editable: "Deze afrekening kan niet meer worden bewerkt.",
  settlement_has_no_items: "Voeg eerst minstens één regel toe.",
  settlement_not_pending_review: "Deze afrekening staat niet (meer) open ter controle.",
  settlement_not_approved: "Deze afrekening is nog niet akkoord bevonden door de tolk.",
  self_billing_not_accepted: "De tolk heeft de self-billing overeenkomst nog niet geaccepteerd.",
  self_billing_terms_outdated:
    "De tolk moet de huidige self-billingvoorwaarden nog accepteren (eerdere acceptatie was van een oudere versie).",
  vat_treatment_missing: "Kies eerst een btw-behandeling voor deze afrekening.",
  vat_rate_missing: "Vul het te hanteren btw-tarief in.",
  fiscal_note_required: "Vul een fiscale toelichting in voordat u deze factuur uitgeeft.",
  business_details_incomplete: "De zakelijke gegevens van de tolk zijn nog niet compleet.",
  payment_details_incomplete: "De betaalgegevens van de tolk zijn nog niet compleet.",
  business_settings_missing: "Bedrijfsgegevens ontbreken.",
  message_required: "Geef aan wat er niet klopt.",
};

export function interpreterInvoiceErrorMessage(code: string): string {
  return INTERPRETER_INVOICE_ERROR_MESSAGES[code] ?? "Actie is niet gelukt.";
}
