import type { BookingStatus } from "@/lib/bookings/constants";

/**
 * Customer-facing status labels, deliberately simpler than (and a strict
 * presentation-layer mapping over) the internal admin statuses - never a
 * second booking lifecycle. Several internal statuses intentionally
 * collapse onto the same customer-facing label: 'customer_accepted' sits
 * between the customer's own acceptance and the admin's final interpreter
 * selection, which from the customer's point of view is still "we're
 * arranging your tolk"; 'customer_invoiced'/'paid' are post-completion
 * administrative statuses the customer just sees as finished work.
 *
 * A pending cancellation_requests row always overrides the status-derived
 * label with "Annulering aangevraagd" (except once the booking itself is
 * actually cancelled, which is unambiguous on its own).
 */
const CUSTOMER_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Aanvraag ontvangen",
  interpreter_search: "Tolk wordt gezocht",
  quoted: "Wacht op uw bevestiging",
  customer_accepted: "Tolk wordt gezocht",
  interpreter_confirmed: "Bevestigd",
  confirmed: "Bevestigd",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
  customer_invoiced: "Afgerond",
  paid: "Afgerond",
};

export function getCustomerFacingStatusLabel(
  status: string,
  hasPendingCancellationRequest: boolean,
): string {
  if (hasPendingCancellationRequest && status !== "cancelled") {
    return "Annulering aangevraagd";
  }

  return CUSTOMER_STATUS_LABELS[status as BookingStatus] ?? status;
}

/** Groups a customer's own bookings for the /klant/opdrachten overview (section 21). */
export type CustomerBookingGroup = "pending" | "upcoming" | "completed" | "cancelled";

export function getCustomerBookingGroup(
  status: string,
  hasPendingCancellationRequest: boolean,
): CustomerBookingGroup {
  if (status === "cancelled") {
    return "cancelled";
  }

  if (hasPendingCancellationRequest) {
    return "upcoming";
  }

  if (status === "completed" || status === "customer_invoiced" || status === "paid") {
    return "completed";
  }

  if (status === "interpreter_confirmed" || status === "confirmed") {
    return "upcoming";
  }

  return "pending";
}

/** Whether "Opnieuw boeken" makes sense for a past booking - any booking that isn't still an open/pending request. */
export function canRebookFrom(status: string): boolean {
  return ["interpreter_confirmed", "confirmed", "completed", "customer_invoiced", "paid", "cancelled"].includes(
    status,
  );
}
