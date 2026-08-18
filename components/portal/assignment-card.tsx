import Link from "next/link";
import {
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITY_LABELS,
  languageLabel,
  type BookingContext,
  type BookingModality,
} from "@/lib/bookings/constants";
import { ASSIGNMENT_STATUS_LABELS, type AssignmentStatus } from "@/lib/assignments/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import type { MyAssignmentOfferRow, MyAssignedBookingRow } from "@/lib/assignments/queries";

export function formatCardDate(dateValue: string | null, timeValue: string | null) {
  if (!dateValue) return "Datum nog niet bekend";
  const date = new Date(`${dateValue}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return timeValue ? `${date} — ${timeValue.slice(0, 5)}` : date;
}

export function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} minuten`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} uur` : `${hours} uur ${rest} min`;
}

const statusPillClass: Record<AssignmentStatus, string> = {
  invited: "bg-amber-100 text-amber-900 border-amber-300",
  viewed: "bg-amber-100 text-amber-900 border-amber-300",
  interested: "bg-sky-100 text-sky-900 border-sky-300",
  declined: "bg-gray-100 text-gray-600 border-gray-300",
  selected: "bg-emerald-100 text-emerald-900 border-emerald-300",
  rejected: "bg-gray-100 text-gray-500 border-gray-300",
  withdrawn: "bg-gray-100 text-gray-500 border-gray-300",
  expired: "bg-gray-100 text-gray-500 border-gray-300",
};

export function OfferCard({ offer }: { offer: MyAssignmentOfferRow }) {
  const duration = formatDuration(offer.expected_duration_minutes);
  const status = offer.status as AssignmentStatus;

  return (
    <Link
      href={`/tolk/opdrachten/${offer.id}`}
      className="content-card block px-5 py-5 transition hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-foreground">
          {formatCardDate(offer.requested_date, offer.requested_start_time)}
        </p>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusPillClass[status] ?? ""}`}
        >
          {ASSIGNMENT_STATUS_LABELS[status] ?? offer.status}
        </span>
      </div>
      {offer.location_name ? (
        <p className="mt-1 text-sm text-muted">{offer.location_name}</p>
      ) : null}
      <p className="mt-2 text-sm text-foreground">
        {languageLabel(offer.language_from)} ↔ {languageLabel(offer.language_to)}
        {" · "}
        {BOOKING_CONTEXT_LABELS[offer.context as BookingContext] ?? offer.context}
      </p>
      {offer.sworn_required ? (
        <p className="mt-1 text-xs font-semibold text-amber-800">Beëdigd tolk vereist</p>
      ) : null}
      {duration ? <p className="mt-1 text-xs text-muted">Verwachte duur: {duration}</p> : null}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-3">
        <p className="text-lg font-semibold text-brand-strong">
          {formatNumberAsCurrency(offer.offered_compensation_ex_vat)}{" "}
          <span className="text-xs font-normal text-muted">excl. btw</span>
        </p>
        {offer.offered_travel_compensation_ex_vat ? (
          <p className="text-sm text-muted">
            + {formatNumberAsCurrency(offer.offered_travel_compensation_ex_vat)} reiskosten
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function BookingCard({ booking }: { booking: MyAssignedBookingRow }) {
  const duration = formatDuration(booking.expected_duration_minutes);

  return (
    <Link
      href={`/tolk/opdrachten/booking-${booking.booking_id}`}
      className="content-card block px-5 py-5 transition hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-foreground">
          {formatCardDate(booking.requested_date, booking.requested_start_time)}
        </p>
        <span className="inline-flex shrink-0 items-center rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted-strong">
          {booking.modality
            ? BOOKING_MODALITY_LABELS[booking.modality as BookingModality]
            : "—"}
        </span>
      </div>
      {booking.location_name ? (
        <p className="mt-1 text-sm text-muted">{booking.location_name}</p>
      ) : null}
      <p className="mt-2 text-sm text-foreground">
        {languageLabel(booking.language_from)} ↔ {languageLabel(booking.language_to)}
        {" · "}
        {BOOKING_CONTEXT_LABELS[booking.context as BookingContext] ?? booking.context}
      </p>
      {duration ? <p className="mt-1 text-xs text-muted">Verwachte duur: {duration}</p> : null}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-3">
        <p className="text-lg font-semibold text-brand-strong">
          {formatNumberAsCurrency(booking.my_compensation_ex_vat)}{" "}
          <span className="text-xs font-normal text-muted">excl. btw</span>
        </p>
        {booking.my_travel_compensation_ex_vat ? (
          <p className="text-sm text-muted">
            + {formatNumberAsCurrency(booking.my_travel_compensation_ex_vat)} reiskosten
          </p>
        ) : null}
      </div>
    </Link>
  );
}
