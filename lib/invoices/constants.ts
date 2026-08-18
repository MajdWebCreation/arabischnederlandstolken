export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "sent",
  "paid",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Concept",
  issued: "Definitief",
  sent: "Verzonden",
  paid: "Betaald",
  cancelled: "Geannuleerd",
};

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value);
}

/** True once an invoice has left draft - financial/snapshot fields are then immutable (enforced in the database too, see enforce_invoice_immutability()). */
export function isIssuedInvoiceStatus(status: string): boolean {
  return status !== "draft";
}

export const INVOICE_EVENT_TYPE_LABELS: Record<string, string> = {
  invoice_created: "Conceptfactuur aangemaakt",
  invoice_issued: "Factuur definitief gemaakt",
  invoice_sent: "Factuur verzonden",
  invoice_marked_paid: "Gemarkeerd als betaald",
  invoice_payment_reverted: "Betaalmarkering ongedaan gemaakt",
  invoice_cancelled: "Factuur geannuleerd",
};

/** Due date passed and still not paid/cancelled - calculated, not a stored status, per the brief's "keep status simple" instruction. */
export function isInvoiceOverdue(status: string, dueDate: string | null): boolean {
  if (status !== "issued" && status !== "sent") {
    return false;
  }

  if (!dueDate) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}
