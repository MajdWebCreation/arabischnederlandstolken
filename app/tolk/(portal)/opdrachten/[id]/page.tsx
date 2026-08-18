import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyAssignedBooking, getMyAssignmentOffer } from "@/lib/assignments/queries";
import {
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITY_LABELS,
  languageLabel,
  type BookingContext,
  type BookingModality,
} from "@/lib/bookings/constants";
import { ASSIGNMENT_STATUS_LABELS, type AssignmentStatus } from "@/lib/assignments/constants";
import { formatCardDate, formatDuration } from "@/components/portal/assignment-card";
import { formatNumberAsCurrency } from "@/lib/money";
import {
  MarkViewedOnMount,
  ReportUnavailableButton,
  RespondButtons,
} from "@/app/tolk/(portal)/opdrachten/[id]/respond-buttons";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOOKING_REF_PREFIX = "booking-";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (id.startsWith(BOOKING_REF_PREFIX)) {
    const bookingId = id.slice(BOOKING_REF_PREFIX.length);

    if (!UUID_PATTERN.test(bookingId)) {
      notFound();
    }

    const booking = await getMyAssignedBooking(supabase, bookingId);

    if (!booking) {
      notFound();
    }

    const duration = formatDuration(booking.expected_duration_minutes);

    return (
      <div className="space-y-6">
        <Link href="/tolk/opdrachten" className="text-sm font-medium text-muted hover:text-brand-strong">
          ← Opdrachten
        </Link>

        <div className="panel px-6 py-6">
          <p className="eyebrow eyebrow-muted">{booking.booking_number}</p>
          <h1 className="mt-2 text-xl font-semibold text-foreground">
            {formatCardDate(booking.requested_date, booking.requested_start_time)}
          </h1>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow
              label="Taalcombinatie"
              value={`${languageLabel(booking.language_from)} ↔ ${languageLabel(booking.language_to)}`}
            />
            <DetailRow
              label="Context"
              value={BOOKING_CONTEXT_LABELS[booking.context as BookingContext] ?? booking.context}
            />
            <DetailRow
              label="Inzetvorm"
              value={
                booking.modality
                  ? BOOKING_MODALITY_LABELS[booking.modality as BookingModality]
                  : "Nog niet bekend"
              }
            />
            <DetailRow label="Verwachte duur" value={duration ?? "Onbekend"} />
            {booking.sworn_required ? (
              <DetailRow label="Beëdiging" value="Beëdigd tolk vereist" />
            ) : null}
            {booking.location_name ? (
              <DetailRow label="Locatie" value={booking.location_name} />
            ) : null}
            {booking.location_address ? (
              <DetailRow label="Adres" value={booking.location_address} />
            ) : null}
            {booking.onsite_contact_name ? (
              <DetailRow label="Contactpersoon ter plaatse" value={booking.onsite_contact_name} />
            ) : null}
            {booking.onsite_contact_phone ? (
              <DetailRow label="Telefoonnummer ter plaatse" value={booking.onsite_contact_phone} />
            ) : null}
          </dl>

          {booking.interpreter_brief ? (
            <div className="mt-5 rounded-xl border border-line bg-surface-alt/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Instructies
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
                {booking.interpreter_brief}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-5">
            <p className="text-xl font-semibold text-brand-strong">
              {formatNumberAsCurrency(booking.my_compensation_ex_vat)}{" "}
              <span className="text-sm font-normal text-muted">excl. btw</span>
            </p>
            {booking.my_travel_compensation_ex_vat ? (
              <p className="text-sm text-muted">
                + {formatNumberAsCurrency(booking.my_travel_compensation_ex_vat)} reiskosten
              </p>
            ) : null}
          </div>
        </div>

        {["interpreter_confirmed", "confirmed"].includes(booking.status) ? (
          <ReportUnavailableButton bookingId={bookingId} />
        ) : null}
      </div>
    );
  }

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const offer = await getMyAssignmentOffer(supabase, id);

  if (!offer) {
    notFound();
  }

  if (offer.status === "selected") {
    redirect(`/tolk/opdrachten/${BOOKING_REF_PREFIX}${offer.booking_id}`);
  }

  const status = offer.status as AssignmentStatus;
  const canRespond = ["invited", "viewed", "interested"].includes(status);
  const isExpired = Boolean(offer.expires_at && new Date(offer.expires_at) < new Date());
  const duration = formatDuration(offer.expected_duration_minutes);

  return (
    <div className="space-y-6">
      {status === "invited" ? <MarkViewedOnMount assignmentId={offer.id} /> : null}

      <Link href="/tolk/opdrachten" className="text-sm font-medium text-muted hover:text-brand-strong">
        ← Opdrachten
      </Link>

      <div className="panel px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">
            {formatCardDate(offer.requested_date, offer.requested_start_time)}
          </h1>
          <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted-strong">
            {ASSIGNMENT_STATUS_LABELS[status] ?? offer.status}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow
            label="Taalcombinatie"
            value={`${languageLabel(offer.language_from)} ↔ ${languageLabel(offer.language_to)}`}
          />
          <DetailRow
            label="Context"
            value={BOOKING_CONTEXT_LABELS[offer.context as BookingContext] ?? offer.context}
          />
          <DetailRow
            label="Inzetvorm"
            value={
              offer.modality
                ? BOOKING_MODALITY_LABELS[offer.modality as BookingModality]
                : "Nog niet bekend"
            }
          />
          <DetailRow label="Verwachte duur" value={duration ?? "Onbekend"} />
          {offer.sworn_required ? (
            <DetailRow label="Beëdiging" value="Beëdigd tolk vereist" />
          ) : null}
          {offer.required_dialect_label ? (
            <DetailRow label="Gevraagd dialect" value={offer.required_dialect_label} />
          ) : null}
          {offer.location_name ? (
            <DetailRow label="Algemene locatie" value={offer.location_name} />
          ) : null}
        </dl>

        {offer.interpreter_brief ? (
          <div className="mt-5 rounded-xl border border-line bg-surface-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Omschrijving</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {offer.interpreter_brief}
            </p>
          </div>
        ) : null}

        {offer.message_to_interpreter ? (
          <div className="mt-3 rounded-xl border border-line bg-surface-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Bericht van de beheerder
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {offer.message_to_interpreter}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-5">
          <p className="text-xl font-semibold text-brand-strong">
            {formatNumberAsCurrency(offer.offered_compensation_ex_vat)}{" "}
            <span className="text-sm font-normal text-muted">excl. btw</span>
          </p>
          {offer.offered_travel_compensation_ex_vat ? (
            <p className="text-sm text-muted">
              + {formatNumberAsCurrency(offer.offered_travel_compensation_ex_vat)} reiskosten
            </p>
          ) : null}
        </div>

        {offer.expires_at ? (
          <p className="mt-3 text-xs text-muted">
            Reageren vóór{" "}
            {new Date(offer.expires_at).toLocaleString("nl-NL", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      {canRespond && !isExpired ? (
        <RespondButtons assignmentId={offer.id} />
      ) : canRespond && isExpired ? (
        <p className="panel-soft px-4 py-4 text-sm text-muted">
          De reactietermijn voor deze opdracht is verlopen.
        </p>
      ) : null}
    </div>
  );
}
