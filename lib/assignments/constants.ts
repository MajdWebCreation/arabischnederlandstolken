export const ASSIGNMENT_STATUSES = [
  "invited",
  "viewed",
  "interested",
  "declined",
  "selected",
  "rejected",
  "withdrawn",
  "expired",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  invited: "Uitgenodigd",
  viewed: "Bekeken",
  interested: "Geïnteresseerd",
  declined: "Afgewezen door tolk",
  selected: "Geselecteerd",
  rejected: "Afgesloten",
  withdrawn: "Ingetrokken",
  expired: "Verlopen",
};

/** Statuses where the offer is still live - admin can select from these, or withdraw a direct invite. */
export const OPEN_ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  "invited",
  "viewed",
  "interested",
];

export const ASSIGNMENT_TYPES = ["open", "direct"] as const;
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  open: "Open opdracht",
  direct: "Directe uitnodiging",
};

export function isAssignmentStatus(value: string): value is AssignmentStatus {
  return (ASSIGNMENT_STATUSES as readonly string[]).includes(value);
}
