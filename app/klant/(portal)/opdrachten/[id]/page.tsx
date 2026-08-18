import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCustomerLayoutSession } from "@/lib/auth/customer";
import {
  getMyCustomerBooking,
  listCancellationRequestsForMyBooking,
  listMyCustomerInvoicesForBooking,
} from "@/lib/customers/portal-queries";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/invoices/constants";
import {
  getCustomerFacingStatusLabel,
  canRebookFrom,
} from "@/lib/customers/portal-status";
import {
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITY_LABELS,
  languageLabel,
  type BookingContext,
  type BookingModality,
} from "@/lib/bookings/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import { OfferActions } from "@/app/klant/(portal)/opdrachten/[id]/offer-actions";
import { CancellationActions } from "@/app/klant/(portal)/opdrachten/[id]/cancellation-actions";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Article 18 of the Algemene Voorwaarden: consent is required whenever the service may start within the statutory 14-day withdrawal period counted from today. */
function isWithinWithdrawalWindow(requestedDate: string | null): boolean {
  if (!requestedDate) return false;
  return (
    new Date(`${requestedDate}T00:00:00`).getTime() <= Date.now() + 14 * 24 * 60 * 60 * 1000
  );
}

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const session = await requireCustomerLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const supabase = await createClient();
  const [booking, cancellationRequests, invoices] = await Promise.all([
    getMyCustomerBooking(supabase, id),
    listCancellationRequestsForMyBooking(supabase, id),
    listMyCustomerInvoicesForBooking(supabase, id),
  ]);

  if (!booking) {
    notFound();
  }

  const pendingRequest = cancellationRequests.find((r) => r.status === "pending");
  const hasInterpreter = Boolean(booking.interpreter_id && booking.interpreter_first_name);

  const subtotal =
    (booking.customer_price_ex_vat ?? 0) + (booking.customer_travel_fee_ex_vat ?? 0);
  const vatAmount = subtotal * (booking.vat_rate / 100);
  const total = subtotal + vatAmount;
  const hasPricing = booking.customer_price_ex_vat !== null;

  const requiresEarlyPerformanceConsent =
    session.customer.type === "individual" && isWithinWithdrawalWindow(booking.requested_date);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/klant/opdrachten" className="text-sm font-medium text-muted hover:text-brand-strong">
          ← Opdrachten
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{booking.booking_number}</h1>
          <span className="chip">
            {getCustomerFacingStatusLabel(booking.status, Boolean(pendingRequest))}
          </span>
        </div>
      </div>

      {booking.status === "quoted" ? (
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Opdrachtvoorstel</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Bekijk onderstaande gegevens en geef aan of u akkoord gaat.
          </p>
          <div className="mt-4">
            <OfferActions bookingId={booking.booking_id} requiresEarlyPerformanceConsent={requiresEarlyPerformanceConsent} />
          </div>
        </section>
      ) : null}

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Gegevens</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Datum" value={formatDate(booking.requested_date) ?? "Nog niet bekend"} />
          <DetailRow
            label="Tijd"
            value={booking.requested_start_time ? booking.requested_start_time.slice(0, 5) : "Nog niet bekend"}
          />
          <DetailRow
            label="Verwachte duur"
            value={booking.expected_duration_minutes ? `${booking.expected_duration_minutes} minuten` : "Nog niet bekend"}
          />
          <DetailRow
            label="Inzetvorm"
            value={booking.modality ? BOOKING_MODALITY_LABELS[booking.modality as BookingModality] : "Nog niet bekend"}
          />
          <DetailRow
            label="Taalcombinatie"
            value={`${languageLabel(booking.language_from)} ↔ ${languageLabel(booking.language_to)}`}
          />
          <DetailRow label="Context" value={BOOKING_CONTEXT_LABELS[booking.context as BookingContext] ?? booking.context} />
          {booking.sworn_required ? <DetailRow label="Beëdiging" value="Beëdigd tolk vereist" /> : null}
          {booking.location_name ? <DetailRow label="Locatie" value={booking.location_name} /> : null}
        </dl>
      </section>

      {hasInterpreter ? (
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Toegewezen tolk</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Naam" value={`${booking.interpreter_first_name} ${booking.interpreter_last_name}`} />
            {booking.interpreter_sworn && booking.interpreter_rbtv_number ? (
              <DetailRow label="Rbtv-nummer" value={booking.interpreter_rbtv_number} />
            ) : null}
            {booking.modality === "telephone" && booking.interpreter_phone ? (
              <DetailRow
                label="Telefoonnummer"
                value={
                  <>
                    {booking.interpreter_phone}
                    <span className="mt-1 block text-xs font-normal text-muted">
                      U kunt de tolk op het afgesproken tijdstip rechtstreeks bellen.
                    </span>
                  </>
                }
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      {hasPricing ? (
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Kosten</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Tolkdienst</dt>
              <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(booking.customer_price_ex_vat)}</dd>
            </div>
            {booking.customer_travel_fee_ex_vat ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted">Reiskosten</dt>
                <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(booking.customer_travel_fee_ex_vat)}</dd>
              </div>
            ) : null}
            {booking.customer_overtime_rate_ex_vat ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted">Overurentarief</dt>
                <dd className="tabular-nums text-foreground">
                  {formatNumberAsCurrency(booking.customer_overtime_rate_ex_vat)} / uur
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <dt className="text-muted">Subtotaal excl. btw</dt>
              <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Btw {booking.vat_rate}%</dt>
              <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(vatAmount)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2 text-base">
              <dt className="font-semibold text-brand-strong">Totaal incl. btw</dt>
              <dd className="font-semibold tabular-nums text-brand-strong">{formatNumberAsCurrency(total)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {invoices.length > 0 ? (
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Facturen</h2>
          <ul className="mt-3 divide-y divide-line">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-foreground">{invoice.invoice_number ?? "In voorbereiding"}</span>
                <span className="flex items-center gap-3">
                  {invoice.total_inc_vat !== null ? (
                    <span className="tabular-nums text-muted">{formatNumberAsCurrency(invoice.total_inc_vat)}</span>
                  ) : null}
                  <span className="chip">
                    {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {booking.customer_message ? (
        <section className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Uw toelichting</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{booking.customer_message}</p>
        </section>
      ) : null}

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Beheer deze opdracht</h2>
        <div className="mt-4">
          <CancellationActions
            bookingId={booking.booking_id}
            bookingStatus={booking.status}
            customerType={session.customer.type}
            hasAcceptedContract={Boolean(booking.terms_accepted_at)}
            hasPendingCancellationRequest={Boolean(pendingRequest)}
            pendingRequestIsWithdrawal={pendingRequest?.request_type === "consumer_withdrawal"}
          />
        </div>

        {canRebookFrom(booking.status) ? (
          <Link
            href={`/klant/aanvragen/nieuw?repeatFrom=${booking.booking_id}`}
            className="button-tertiary mt-4 block w-full px-5 py-3 text-center"
          >
            Opnieuw boeken
          </Link>
        ) : null}
      </section>
    </div>
  );
}
