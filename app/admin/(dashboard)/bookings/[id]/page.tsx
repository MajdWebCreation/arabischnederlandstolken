import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingById, getBookingEvents } from "@/lib/bookings/queries";
import { listInterpreters } from "@/lib/interpreters/queries";
import {
  listInterpretersForMatching,
  listCapabilityTags,
  matchInterpreters,
  findSchedulingConflicts,
  type SchedulingConflict,
} from "@/lib/interpreters/matching";
import { listAssignmentsForBooking } from "@/lib/assignments/queries";
import { OPEN_ASSIGNMENT_STATUSES, type AssignmentStatus } from "@/lib/assignments/constants";
import { listInvoicesForBooking } from "@/lib/invoices/queries";
import { getInterpreterInvoiceForBooking } from "@/lib/interpreter-invoices/queries";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import {
  INTERPRETER_INVOICE_STATUS_LABELS,
  isInterpreterInvoiceStatus,
} from "@/lib/interpreter-invoices/constants";
import { getInterpreterById } from "@/lib/interpreters/queries";
import {
  getInterpreterCompleteness,
  getInterpreterMissingRequirements,
} from "@/lib/interpreters/completeness";
import {
  createInterpreterSettlementDraft,
  submitInterpreterSettlementForReview,
  issueInterpreterInvoiceAction,
  markInterpreterInvoicePaidAction,
  requestInterpreterProfileCompletion,
} from "@/app/admin/(dashboard)/interpreter-invoices/[id]/actions";
import {
  listCancellationRequestsForBooking,
  listUnavailabilityReportsForBooking,
} from "@/lib/cancellation/queries";
import {
  CancellationRequestsSection,
  UnavailabilityReportsSection,
} from "@/app/admin/(dashboard)/bookings/[id]/cancellation-forms";
import { InvoiceList } from "@/components/admin/invoice-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  formatNumberAsCurrency,
  calculateMarginCents,
  numberToCents,
  formatCentsAsCurrency,
  calculateInvoiceLineTotalsCents,
  sumInvoiceLineTotalsCents,
} from "@/lib/money";
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
import {
  CandidatesTable,
  PublishOpenAssignmentForm,
  SuitableInterpretersSection,
} from "@/app/admin/(dashboard)/bookings/[id]/assignment-forms";
import { createDraftInvoiceFromBooking } from "@/app/admin/(dashboard)/bookings/[id]/actions";

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
  open_assignment_published: "Gepubliceerd als open opdracht",
  interpreter_invited: "Tolk uitgenodigd",
  interpreter_interested: "Tolk toonde interesse",
  interpreter_declined: "Tolk wees af",
  interpreter_selected: "Tolk geselecteerd",
  invitation_withdrawn: "Uitnodiging ingetrokken",
  assignment_closed: "Kandidatuur afgesloten",
  customer_request_created: "Aanvraag ontvangen via klantportaal",
  customer_offer_sent: "Opdrachtvoorstel verstuurd",
  customer_accepted: "Klant is akkoord gegaan",
  customer_change_requested: "Klant heeft wijziging aangevraagd",
  terms_accepted: "Algemene voorwaarden geaccepteerd",
  consumer_early_performance_consent: "Toestemming vroege uitvoering (bedenktijd)",
  customer_withdrawn_request: "Klant heeft aanvraag ingetrokken",
  cancellation_requested: "Annulering/herroeping aangevraagd",
  cancellation_approved: "Annulering goedgekeurd",
  cancellation_rejected: "Annuleringsverzoek afgewezen",
  interpreter_unavailability_reported: "Tolk meldde zich verhinderd",
  replacement_search_started: "Zoeken naar vervangende tolk gestart",
  replacement_interpreter_selected: "Vervangende tolk toegewezen",
  customer_confirmation_sent: "Bevestiging naar klant verstuurd",
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

/**
 * customer_offer_snapshot (jsonb) is written exactly once, at acceptance,
 * by customer_accept_booking_offer() - see
 * supabase/migrations/20260818120800_customer_offer_snapshot.sql. This is
 * a read-only display type for that frozen shape, not a schema the
 * database enforces column-by-column.
 */
type CustomerOfferSnapshot = {
  customer_price_ex_vat: number | null;
  customer_travel_fee_ex_vat: number | null;
  customer_overtime_rate_ex_vat: number | null;
  vat_rate: number;
  expected_duration_minutes: number | null;
  requested_date: string | null;
  requested_start_time: string | null;
  modality: string | null;
  language_from: string;
  language_to: string;
  sworn_required: boolean;
  cancellation_terms_reference: string | null;
  terms_version: string;
  accepted_at: string;
  accepted_by_user_id: string | null;
};

function isCustomerOfferSnapshot(value: unknown): value is CustomerOfferSnapshot {
  return Boolean(value) && typeof value === "object" && "accepted_at" in (value as object);
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
  const [
    booking,
    events,
    interpreters,
    interpretersForMatching,
    capabilityTags,
    assignments,
    invoices,
    cancellationRequests,
    unavailabilityReports,
    interpreterInvoice,
    businessSettings,
  ] = await Promise.all([
    getBookingById(supabase, id),
    getBookingEvents(supabase, id),
    listInterpreters(supabase),
    listInterpretersForMatching(supabase),
    listCapabilityTags(supabase),
    listAssignmentsForBooking(supabase, id),
    listInvoicesForBooking(supabase, id),
    listCancellationRequestsForBooking(supabase, id),
    listUnavailabilityReportsForBooking(supabase, id),
    getInterpreterInvoiceForBooking(supabase, id),
    getBusinessSettings(supabase),
  ]);

  if (!booking) {
    notFound();
  }

  // Only fetched/used for the Tolkenafrekening readiness check below - the
  // interpreter row already carries everything getInterpreterCompleteness
  // needs, so no separate query for just those fields is worth adding.
  const assignedInterpreter = booking.interpreter_id
    ? await getInterpreterById(supabase, booking.interpreter_id)
    : null;
  const interpreterReadiness = assignedInterpreter
    ? {
        paymentReady: getInterpreterCompleteness(
          assignedInterpreter,
          assignedInterpreter.interpreter_languages.length,
        ).paymentReady,
        missing: getInterpreterMissingRequirements(
          assignedInterpreter,
          assignedInterpreter.interpreter_languages.length,
        )
          .filter((item) => ["zakelijk", "betaalgegevens", "facturatie"].includes(item.section))
          .map((item) => item.label),
      }
    : null;

  const dialectTags = capabilityTags.filter((tag) => tag.category === "dialect" && tag.active);
  const requiredDialectTag =
    capabilityTags.find((tag) => tag.id === booking.required_dialect_tag_id) ?? null;

  const invitedInterpreterIds = new Set(assignments.map((a) => a.interpreter_id));
  const matches = matchInterpreters(booking, interpretersForMatching, requiredDialectTag).filter(
    (match) => !invitedInterpreterIds.has(match.interpreter.id),
  );

  const canScheduleCheck = Boolean(booking.requested_date && booking.requested_start_time);
  const activeCandidates = assignments.filter((a) =>
    OPEN_ASSIGNMENT_STATUSES.includes(a.status as AssignmentStatus),
  );
  const conflictEntries = canScheduleCheck
    ? await Promise.all(
        activeCandidates.map(async (assignment) => {
          const conflicts = await findSchedulingConflicts(supabase, {
            interpreterId: assignment.interpreter_id,
            requestedDate: booking.requested_date as string,
            requestedStartTime: booking.requested_start_time as string,
            expectedDurationMinutes: booking.expected_duration_minutes,
            excludeBookingId: booking.id,
          });
          return [assignment.id, conflicts] as [string, SchedulingConflict[]];
        }),
      )
    : [];
  const conflictsByAssignmentId = Object.fromEntries(conflictEntries);

  const marginCents = calculateMarginCents({
    customerPriceCents: numberToCents(booking.customer_price_ex_vat),
    customerTravelFeeCents: numberToCents(booking.customer_travel_fee_ex_vat),
    interpreterCostCents: numberToCents(booking.interpreter_cost_ex_vat),
    interpreterTravelCostCents: numberToCents(
      booking.interpreter_travel_cost_ex_vat,
    ),
  });

  const invoicePreviewLines =
    booking.customer_price_ex_vat !== null
      ? [
          calculateInvoiceLineTotalsCents({
            quantity: 1,
            unitPriceExVatCents: numberToCents(booking.customer_price_ex_vat) ?? 0,
            vatRatePercent: booking.vat_rate,
          }),
          ...(booking.customer_travel_fee_ex_vat
            ? [
                calculateInvoiceLineTotalsCents({
                  quantity: 1,
                  unitPriceExVatCents: numberToCents(booking.customer_travel_fee_ex_vat) ?? 0,
                  vatRatePercent: booking.vat_rate,
                }),
              ]
            : []),
        ]
      : [];
  const invoicePreviewTotals = sumInvoiceLineTotalsCents(invoicePreviewLines);

  const acceptedOffer = isCustomerOfferSnapshot(booking.customer_offer_snapshot)
    ? booking.customer_offer_snapshot
    : null;

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
                <BookingDetailsForm bookingId={booking.id} booking={booking} dialectTags={dialectTags} />
              </div>
            </div>
          </section>

          {cancellationRequests.length > 0 || unavailabilityReports.length > 0 ? (
            <section className="panel px-6 py-6">
              {cancellationRequests.length > 0 ? (
                <>
                  <h2 className="text-base font-semibold text-foreground">
                    Annulerings-/herroepingsverzoeken
                  </h2>
                  <div className="mt-4">
                    <CancellationRequestsSection bookingId={booking.id} requests={cancellationRequests} />
                  </div>
                </>
              ) : null}
              {unavailabilityReports.length > 0 ? (
                <div className={cancellationRequests.length > 0 ? "mt-6 border-t border-line pt-6" : ""}>
                  <UnavailabilityReportsSection reports={unavailabilityReports} />
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">
              Tolktoewijzing (snel, direct)
            </h2>
            <p className="mt-1 text-xs text-muted">
              Wijst direct toe zonder uitnodiging/reactie - gebruik dit als u al
              weet wie de opdracht doet. Voor het werven en vergelijken van
              kandidaten, zie &ldquo;Tolken werven&rdquo; hieronder.
            </p>
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
              Tolken werven
            </h2>

            {!canScheduleCheck ? (
              <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900">
                Stel eerst een datum en tijd in bij de boekingsgegevens hierboven.
                Deze boeking kan pas als opdracht gepubliceerd worden zodra dat
                bekend is.
              </p>
            ) : null}

            {assignments.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground">Kandidaten</h3>
                <div className="mt-2">
                  <CandidatesTable
                    bookingId={booking.id}
                    assignments={assignments}
                    conflictsByAssignmentId={conflictsByAssignmentId}
                  />
                </div>
              </div>
            ) : null}

            {!booking.interpreter_id && canScheduleCheck ? (
              <>
                <div className="mt-6 border-t border-line pt-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    Geschikte tolken uitnodigen
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Gebaseerd op taalcombinatie, beëdiging/Rbtv, dialect en
                    specialisatie. Rbtv-gegevens zijn handmatig bijgehouden en
                    niet onafhankelijk geverifieerd.
                  </p>
                  <div className="mt-4">
                    <SuitableInterpretersSection bookingId={booking.id} matches={matches} />
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    Of publiceer als open opdracht
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Wordt zichtbaar voor alle op dit moment geschikte tolken in
                    hun portaal, die zelf interesse kunnen tonen.
                    {booking.is_open_assignment
                      ? " Deze boeking is al eerder gepubliceerd; opnieuw publiceren nodigt alleen nieuw geschikte tolken uit die nog geen kandidaat zijn."
                      : ""}
                  </p>
                  <div className="mt-4">
                    <PublishOpenAssignmentForm bookingId={booking.id} />
                  </div>
                </div>
              </>
            ) : null}
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
              <BookingFinancialsForm
                bookingId={booking.id}
                booking={booking}
                defaultTargetMarginPercent={Number(
                  businessSettings.default_interpreter_target_margin_percent,
                )}
              />
            </div>
          </section>

          {acceptedOffer ? (
            <section className="panel px-6 py-6">
              <h2 className="text-base font-semibold text-foreground">
                Geaccepteerd opdrachtvoorstel
              </h2>
              <p className="mt-1 text-xs text-muted">
                Vastgelegd op het moment dat de klant akkoord ging. Dit is een
                onveranderlijk historisch bewijs van de destijds geaccepteerde
                voorwaarden - latere aanpassingen aan de financiële velden
                hierboven wijzigen dit overzicht nooit.
              </p>
              <dl className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Geaccepteerd op
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{formatDateTime(acceptedOffer.accepted_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Voorwaarden-versie
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{acceptedOffer.terms_version}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Geaccepteerde klantprijs
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatNumberAsCurrency(acceptedOffer.customer_price_ex_vat)}
                  </dd>
                </div>
                {acceptedOffer.customer_travel_fee_ex_vat ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Geaccepteerde reiskosten
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {formatNumberAsCurrency(acceptedOffer.customer_travel_fee_ex_vat)}
                    </dd>
                  </div>
                ) : null}
                {acceptedOffer.customer_overtime_rate_ex_vat ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Geaccepteerd overurentarief
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {formatNumberAsCurrency(acceptedOffer.customer_overtime_rate_ex_vat)}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Btw-tarief</dt>
                  <dd className="mt-1 text-sm text-foreground">{Number(acceptedOffer.vat_rate)}%</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Geaccepteerde planning
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {acceptedOffer.requested_date
                      ? new Date(`${acceptedOffer.requested_date}T00:00:00`).toLocaleDateString("nl-NL")
                      : "—"}
                    {acceptedOffer.requested_start_time ? ` · ${acceptedOffer.requested_start_time.slice(0, 5)}` : ""}
                    {acceptedOffer.expected_duration_minutes ? ` · ${acceptedOffer.expected_duration_minutes} min.` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Geaccepteerde taal/inzetvorm
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {languageLabel(acceptedOffer.language_from)} → {languageLabel(acceptedOffer.language_to)}
                    {acceptedOffer.modality
                      ? ` · ${BOOKING_MODALITY_LABELS[acceptedOffer.modality as BookingModality] ?? acceptedOffer.modality}`
                      : ""}
                    {acceptedOffer.sworn_required ? " · beëdigd tolk vereist" : ""}
                  </dd>
                </div>
                {acceptedOffer.cancellation_terms_reference ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Annuleringsvoorwaarden bij acceptatie
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-foreground">
                      {acceptedOffer.cancellation_terms_reference}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Facturatie</h2>

            {booking.customer_price_ex_vat !== null ? (
              <>
                <div className="mt-4 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">Tolkdienst</dt>
                      <dd className="tabular-nums text-foreground">
                        {formatNumberAsCurrency(booking.customer_price_ex_vat)}
                      </dd>
                    </div>
                    {booking.customer_travel_fee_ex_vat ? (
                      <div className="flex items-center justify-between">
                        <dt className="text-muted">Reiskosten</dt>
                        <dd className="tabular-nums text-foreground">
                          {formatNumberAsCurrency(booking.customer_travel_fee_ex_vat)}
                        </dd>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between border-t border-line pt-2">
                      <dt className="text-muted">Subtotaal excl. btw</dt>
                      <dd className="tabular-nums text-foreground">
                        {formatCentsAsCurrency(invoicePreviewTotals.subtotalExVatCents)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">Btw {Number(booking.vat_rate)}%</dt>
                      <dd className="tabular-nums text-foreground">
                        {formatCentsAsCurrency(invoicePreviewTotals.totalVatCents)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-2 text-base">
                      <dt className="font-semibold text-brand-strong">Totaal incl. btw</dt>
                      <dd className="font-semibold tabular-nums text-brand-strong">
                        {formatCentsAsCurrency(invoicePreviewTotals.totalIncVatCents)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <form action={createDraftInvoiceFromBooking.bind(null, booking.id)} className="mt-4">
                  <button type="submit" className="button-primary px-5 py-2.5">
                    {invoices.length > 0 ? "Nieuwe conceptfactuur maken" : "Conceptfactuur maken"}
                  </button>
                </form>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Stel eerst een klantprijs in bij Financiën om een factuur te kunnen
                maken.
              </p>
            )}

            {invoices.length > 0 ? (
              <div className="mt-6 border-t border-line pt-6">
                <h3 className="text-sm font-semibold text-foreground">Facturen</h3>
                <InvoiceList invoices={invoices} emptyText="Nog geen facturen." />
              </div>
            ) : null}
          </section>

          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Tolkenafrekening</h2>
            <p className="mt-1 text-xs text-muted">
              Aparte boekhoudstroom (self-billing): de tolk factureert
              Arabisch Nederlands Tolken voor de uitgevoerde dienst - dit is
              nooit afgeleid van de klantprijs hierboven. Deze boeking
              afronden geeft nooit vanzelf een officiële ANT-SB-factuur uit -
              dat blijft een aparte, bewust gecontroleerde stap verderop in
              dit overzicht.
            </p>

            {!booking.interpreter_id ? (
              <p className="mt-3 text-sm text-muted">
                Wijs eerst definitief een tolk toe om een afrekening te kunnen maken.
              </p>
            ) : !interpreterInvoice ? (
              booking.status === "completed" ? (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-foreground">Nog niet voorbereid</p>
                  <form action={createInterpreterSettlementDraft.bind(null, booking.id)} className="mt-2">
                    <button type="submit" className="button-primary px-5 py-2.5">
                      Maak afrekening
                    </button>
                  </form>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  Rond eerst de boeking af (status &apos;Afgerond&apos;) om een afrekening te kunnen maken.
                </p>
              )
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4">
                  <div>
                    <Link
                      href={`/admin/interpreter-invoices/${interpreterInvoice.id}`}
                      className="text-sm font-semibold text-brand-strong hover:underline"
                    >
                      {interpreterInvoice.invoice_number ?? "Conceptafrekening"}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatNumberAsCurrency(interpreterInvoice.total_inc_vat)}
                    </p>
                  </div>
                  <span className="chip">
                    {isInterpreterInvoiceStatus(interpreterInvoice.status)
                      ? INTERPRETER_INVOICE_STATUS_LABELS[interpreterInvoice.status]
                      : interpreterInvoice.status}
                  </span>
                </div>

                {interpreterInvoice.status === "draft" ? (
                  interpreterReadiness && !interpreterReadiness.paymentReady ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                      <p className="text-sm font-semibold text-amber-900">Profiel tolk incompleet</p>
                      <p className="mt-1 text-xs leading-5 text-amber-900">
                        Ontbrekend: {interpreterReadiness.missing.join(", ")}.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/interpreters/${booking.interpreter_id}`}
                          className="button-secondary px-4 py-2 text-sm"
                        >
                          Bekijk ontbrekende gegevens
                        </Link>
                        <form action={requestInterpreterProfileCompletion.bind(null, booking.interpreter_id)}>
                          <button type="submit" className="button-secondary px-4 py-2 text-sm">
                            Vraag tolk profiel af te ronden
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Klaar om te versturen</p>
                      <AdminActionForm
                        action={submitInterpreterSettlementForReview.bind(
                          null,
                          interpreterInvoice.id,
                          booking.id,
                        )}
                        submitLabel="Naar tolk sturen"
                        className="mt-2"
                      >
                        <></>
                      </AdminActionForm>
                    </div>
                  )
                ) : null}

                {interpreterInvoice.status === "pending_review" ? (
                  <p className="text-sm text-muted">Wacht op controle tolk.</p>
                ) : null}

                {interpreterInvoice.status === "change_requested" ? (
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Wijziging aangevraagd</p>
                    <Link
                      href={`/admin/interpreter-invoices/${interpreterInvoice.id}`}
                      className="button-secondary mt-2 inline-flex px-4 py-2 text-sm"
                    >
                      Bekijk verzoek
                    </Link>
                  </div>
                ) : null}

                {interpreterInvoice.status === "approved" ? (
                  <div>
                    <p className="text-sm font-semibold text-foreground">Akkoord</p>
                    <AdminActionForm
                      action={issueInterpreterInvoiceAction.bind(null, interpreterInvoice.id, booking.id)}
                      submitLabel="Factuur uitgeven"
                      className="mt-2"
                    >
                      <></>
                    </AdminActionForm>
                  </div>
                ) : null}

                {interpreterInvoice.status === "issued" ? (
                  <div>
                    <p className="text-sm font-semibold text-foreground">Definitief</p>
                    <p className="mt-1 text-sm text-muted">{interpreterInvoice.invoice_number}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={`/admin/interpreter-invoices/${interpreterInvoice.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary px-4 py-2 text-sm"
                      >
                        Bekijk PDF
                      </a>
                      <AdminActionForm
                        action={markInterpreterInvoicePaidAction.bind(null, interpreterInvoice.id, booking.id)}
                        submitLabel="Markeer als betaald"
                      >
                        <></>
                      </AdminActionForm>
                    </div>
                  </div>
                ) : null}

                {interpreterInvoice.status === "paid" ? (
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Betaald</p>
                    {interpreterInvoice.paid_at ? (
                      <p className="mt-1 text-sm text-muted">
                        Betaald op {new Date(interpreterInvoice.paid_at).toLocaleDateString("nl-NL")}
                      </p>
                    ) : null}
                    <a
                      href={`/admin/interpreter-invoices/${interpreterInvoice.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary mt-2 inline-flex px-4 py-2 text-sm"
                    >
                      Bekijk PDF
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel px-6 py-6">
            <h2 className="text-base font-semibold text-foreground">Status</h2>
            <div className="mt-4">
              <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} booking={booking} />
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
