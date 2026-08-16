import {
  contextValues,
  requestTypeValues,
  type ContactContext,
  type RequestType,
} from "@/lib/contact/types";

// request_type and context reuse the exact value sets the public contact
// form already validates against (lib/contact/types.ts), which are also
// what the bookings table's CHECK constraints allow. Importing them here
// instead of redefining keeps the three in permanent agreement.
export const BOOKING_REQUEST_TYPES = requestTypeValues;
export type BookingRequestType = RequestType;

export const BOOKING_REQUEST_TYPE_LABELS: Record<BookingRequestType, string> = {
  regular: "Regulier",
  urgent: "Spoed",
  sworn: "Beëdigd",
  availability: "Beschikbaarheidsvraag",
  other: "Anders",
};

export const BOOKING_CONTEXTS = contextValues;
export type BookingContext = ContactContext;

export const BOOKING_CONTEXT_LABELS: Record<BookingContext, string> = {
  healthcare: "Zorg",
  municipality: "Gemeente",
  legal: "Juridisch",
  migration: "Migratie / IND",
  business: "Zakelijk",
  other: "Anders",
};

export const BOOKING_MODALITIES = ["telephone", "video", "onsite"] as const;
export type BookingModality = (typeof BOOKING_MODALITIES)[number];

export const BOOKING_MODALITY_LABELS: Record<BookingModality, string> = {
  telephone: "Telefonisch",
  video: "Video",
  onsite: "Op locatie",
};

export const BOOKING_SOURCES = [
  "website",
  "phone",
  "email",
  "referral",
  "admin",
  "other",
] as const;
export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  website: "Website",
  phone: "Telefoon",
  email: "E-mail",
  referral: "Doorverwijzing",
  admin: "Handmatig door beheerder",
  other: "Anders",
};

export const BOOKING_STATUSES = [
  "new",
  "interpreter_search",
  "quoted",
  "customer_accepted",
  "interpreter_confirmed",
  "confirmed",
  "completed",
  "cancelled",
  "customer_invoiced",
  "paid",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Nieuw",
  interpreter_search: "Tolk zoeken",
  quoted: "Offerte verstuurd",
  customer_accepted: "Geaccepteerd door klant",
  interpreter_confirmed: "Tolk bevestigd",
  confirmed: "Bevestigd",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
  customer_invoiced: "Gefactureerd",
  paid: "Betaald",
};

/** Statuses that represent unfinished work the admin dashboard should surface. */
export const OPEN_BOOKING_STATUSES: BookingStatus[] = [
  "new",
  "interpreter_search",
  "quoted",
  "customer_accepted",
  "interpreter_confirmed",
];

export const UPCOMING_BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "interpreter_confirmed",
];

export const FORM_LANGUAGES = ["nl", "ar"] as const;
export type FormLanguage = (typeof FORM_LANGUAGES)[number];

export const FORM_LANGUAGE_LABELS: Record<FormLanguage, string> = {
  nl: "Nederlands",
  ar: "Arabisch",
};

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function isBookingModality(value: string): value is BookingModality {
  return (BOOKING_MODALITIES as readonly string[]).includes(value);
}

/**
 * Short lowercase language codes used across bookings and
 * interpreter_languages, kept free text at the database level so this list
 * can grow without a migration. Deliberately small for Phase 1: the site
 * only serves Arabic<->Dutch today.
 */
export const COMMON_LANGUAGE_CODES = [
  { code: "ar", label: "Arabisch" },
  { code: "nl", label: "Nederlands" },
] as const;

export function languageLabel(code: string): string {
  const match = COMMON_LANGUAGE_CODES.find((entry) => entry.code === code);
  return match ? match.label : code;
}
