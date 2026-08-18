export const CANCELLATION_REQUEST_TYPES = ["cancellation", "consumer_withdrawal"] as const;
export type CancellationRequestType = (typeof CANCELLATION_REQUEST_TYPES)[number];

export const CANCELLATION_REQUEST_TYPE_LABELS: Record<CancellationRequestType, string> = {
  cancellation: "Annulering",
  consumer_withdrawal: "Herroepingsrecht (consument)",
};

export const CANCELLATION_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type CancellationRequestStatus = (typeof CANCELLATION_REQUEST_STATUSES)[number];

export const CANCELLATION_REQUEST_STATUS_LABELS: Record<CancellationRequestStatus, string> = {
  pending: "In behandeling",
  approved: "Goedgekeurd",
  rejected: "Afgewezen",
};

export const UNAVAILABILITY_REPORT_STATUS_LABELS: Record<string, string> = {
  open: "Vraagt aandacht",
  resolved: "Afgehandeld",
};
