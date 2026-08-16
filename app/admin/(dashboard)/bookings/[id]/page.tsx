import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingById, getBookingEvents } from "@/lib/bookings/queries";
import { listInterpreters } from "@/lib/interpreters/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatNumberAsCurrency, calculateMarginCents, numberToCents, formatCentsAsCurrency } from "@/lib/money";
import {
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITY_LABELS,
  BOOKING_REQUEST_TYPE_LABELS,
  BOOKING_SOURCE_LABELS,
  languageLabel,
  type BookingContext,
  type BookingModality,
  type BookingRequestType,
  type BookingSource,
} from "@/lib/bookings/constants";
import {
  BookingDetailsForm,
  BookingFinancialsForm,
  BookingInternalNotesForm,
  BookingInterpreterForm,
  BookingStatusForm,
} from "@/app/admin/(dashboard)/bookings/[id]/booking-forms";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const eventTypeLabels: Record<string, string> = {
  booking_created: "Aanvraag ontvangen",
  status_changed: "Status gewijzigd",
  interpreter_assigned: "Tolk toegewezen",
  interpreter_removed: "Tolk verwijderd",
  customer_price_changed: "Klantprijs gewijzigd",
  interpreter_cost_changed: "Tolkkosten gewijzigd",
  financials_updated: "Financiën bijgewerkt",
  booking_completed: "Boeking afgerond",
  note_added: "Notitie toegevoegd",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const [booking, events, interpreters] = await Promise.all([
    getBookingById(supabase, id),
    getBookingEvents(supabase, id),
    listInterpreters(supabase),
  ]);

  if (!booking) {
    notFound();
  }

  const marginCents = calculateMarginCents({
    customerPriceCents: numberToCents(booking.customer_price_ex_vat),
    customerTravelFeeCents: numberToCents(booking.customer_travel_fee_ex_vat),
    interpreterCostCents: numberToCents(booking.interpreter_cost_ex_vat),
    interpreterTravelCostCents: numberToCents(
      booking.interpreter_travel_cost_ex_vat,
    ),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-muted hover:text-brand-strong"
          >
            ← Alle boekingen
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {booking.booking_number}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="chip">
              {BOOKING_SOURCE_LABELS[booking.source as BookingSource] ?? booking.source}
            </span>
            {booking.sworn_required ? (
              <span className="chip border-amber-300 bg-amber-50 text-amber-900">
                Beëdigd tolk vereist
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Klant</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Naam
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.customer.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Organisatie
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.customer.organisation || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  E-mail
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  <a href={`mailto:${booking.customer.email}`} className="hover:underline">
                    {booking.customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Telefoon
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.customer.phone || "—"}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/customers/${booking.customer.id}`}
              className="mt-4 inline-block text-sm font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              Klantprofiel bekijken
            </Link>
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Boeking</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Soort aanvraag
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {BOOKING_REQUEST_TYPE_LABELS[booking.request_type as BookingRequestType] ??
                    booking.request_type}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Context
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {BOOKING_CONTEXT_LABELS[booking.context as BookingContext] ?? booking.context}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Taalrichting
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {languageLabel(booking.language_from)} → {languageLabel(booking.language_to)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Huidige inzetvorm
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.modality
                    ? BOOKING_MODALITY_LABELS[booking.modality as BookingModality]
                    : "Nog niet bekend"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Bericht van klant
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {booking.customer_message || "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Planningsgegevens bewerken
              </h3>
              <p className="mt-1 text-xs text-muted">
                Datum, tijd, duur en locatie worden meestal pas na telefonisch
                contact met de klant bevestigd.
              </p>
              <div className="mt-4">
                <BookingDetailsForm bookingId={booking.id} booking={booking} />
              </div>
            </div>
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">
              Tolktoewijzing
            </h2>
            <div className="mt-4">
              <BookingInterpreterForm
                bookingId={booking.id}
                currentInterpreterId={booking.interpreter_id}
                interpreters={interpreters}
                swornRequired={booking.sworn_required}
              />
            </div>
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">
              Financiën
            </h2>
            <p className="mt-1 text-xs text-muted">
              Alleen zichtbaar voor beheerders. Wordt nooit publiek getoond.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Klantomzet
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatNumberAsCurrency(booking.customer_price_ex_vat)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Tolkkosten
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatNumberAsCurrency(booking.interpreter_cost_ex_vat)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Geschatte marge (excl. overuren)
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-strong">
                  {formatCentsAsCurrency(marginCents)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <BookingFinancialsForm bookingId={booking.id} booking={booking} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Status</h2>
            <div className="mt-4">
              <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
            </div>
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">
              Interne notities
            </h2>
            <div className="mt-4">
              <BookingInternalNotesForm
                bookingId={booking.id}
                internalNotes={booking.internal_notes}
              />
            </div>
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">
              Geschiedenis
            </h2>
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="border-s-2 border-brand/25 ps-4">
                  <p className="text-sm font-semibold text-foreground">
                    {eventTypeLabels[event.event_type] ?? event.event_type}
                  </p>
                  {event.description ? (
                    <p className="mt-0.5 text-sm text-muted">
                      {event.description}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(event.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
