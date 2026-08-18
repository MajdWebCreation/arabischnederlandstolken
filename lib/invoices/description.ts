import "server-only";

import type { Database } from "@/lib/supabase/database.types";
import { languageLabel, BOOKING_MODALITY_LABELS, type BookingModality } from "@/lib/bookings/constants";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

function formatServiceDate(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatServiceDuration(minutes: number | null) {
  if (!minutes) {
    return null;
  }

  if (minutes < 60) {
    return `${minutes} minuten`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} uur` : `${hours} uur ${rest} min`;
}

/**
 * Builds the default "Tolkdienst"/"Beëdigde tolk ..." line description from
 * whatever the booking actually has on file - date, duration, and modality
 * only, deliberately not every booking field, so the printed line stays
 * readable. The admin can freely edit this on the draft afterward.
 */
export function buildServiceLineDescription(booking: Booking): string {
  const swornPrefix = booking.sworn_required ? "Beëdigde tolk" : "Tolkdienst";
  const languagePart = `${languageLabel(booking.language_from)} ↔ ${languageLabel(booking.language_to)}`;

  const detailParts = [
    formatServiceDate(booking.requested_date),
    formatServiceDuration(booking.expected_duration_minutes),
    booking.modality
      ? BOOKING_MODALITY_LABELS[booking.modality as BookingModality]
      : null,
  ].filter((part): part is string => Boolean(part));

  const detail = detailParts.length > 0 ? ` (${detailParts.join(", ")})` : "";

  return `${swornPrefix} ${languagePart}${detail}`;
}

export const TRAVEL_LINE_DESCRIPTION = "Reiskosten";
