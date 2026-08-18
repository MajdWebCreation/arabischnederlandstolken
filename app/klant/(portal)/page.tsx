import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCustomerLayoutSession } from "@/lib/auth/customer";
import { listMyCustomerBookings } from "@/lib/customers/portal-queries";
import { listCancellationRequestsForMyBooking } from "@/lib/customers/portal-queries";
import { getCustomerBookingGroup, getCustomerFacingStatusLabel, canRebookFrom } from "@/lib/customers/portal-status";
import { languageLabel } from "@/lib/bookings/constants";
import { listMyCustomerInvoices } from "@/lib/customers/portal-queries";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Datum nog niet bekend";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CustomerDashboardPage() {
  const session = await requireCustomerLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const supabase = await createClient();
  const [bookings, invoices] = await Promise.all([
    listMyCustomerBookings(supabase),
    listMyCustomerInvoices(supabase),
  ]);
  const openInvoiceCount = invoices.filter((invoice) => ["issued", "sent"].includes(invoice.status ?? "")).length;
  const latestInvoices = invoices.slice(0, 2);

  // Pending cancellation requests only ever exist on a small handful of
  // recent bookings - fetching them per-row here (rather than a bulk view)
  // keeps the customer-facing status/grouping logic in one shared place
  // (lib/customers/portal-status.ts) without a second database view.
  const withPendingFlags = await Promise.all(
    bookings.map(async (booking) => {
      const requests = await listCancellationRequestsForMyBooking(supabase, booking.booking_id);
      return { booking, hasPendingCancellation: requests.some((r) => r.status === "pending") };
    }),
  );

  const pending = withPendingFlags.filter(
    ({ booking, hasPendingCancellation }) =>
      getCustomerBookingGroup(booking.status, hasPendingCancellation) === "pending",
  );
  const upcoming = withPendingFlags.filter(
    ({ booking, hasPendingCancellation }) =>
      getCustomerBookingGroup(booking.status, hasPendingCancellation) === "upcoming",
  );
  const completed = withPendingFlags.filter(
    ({ booking, hasPendingCancellation }) =>
      getCustomerBookingGroup(booking.status, hasPendingCancellation) === "completed",
  );

  const rebookCandidate = withPendingFlags.find(({ booking }) => canRebookFrom(booking.status));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow eyebrow-muted">Klantportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welkom, {session.customer.organisation || session.customer.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/klant/aanvragen/nieuw"
          className="button-primary flex flex-col items-start gap-1 rounded-2xl px-5 py-5 text-left"
        >
          <span className="text-base font-semibold">Nieuwe tolkaanvraag</span>
          <span className="text-sm font-normal opacity-90">
            Vraag in minder dan een minuut een tolk aan.
          </span>
        </Link>

        {rebookCandidate ? (
          <Link
            href={`/klant/aanvragen/nieuw?repeatFrom=${rebookCandidate.booking.booking_id}`}
            className="button-secondary flex flex-col items-start gap-1 rounded-2xl px-5 py-5 text-left"
          >
            <span className="text-base font-semibold">Opnieuw boeken</span>
            <span className="text-sm font-normal opacity-90">
              Op basis van uw laatste opdracht ({languageLabel(rebookCandidate.booking.language_from)}{" "}
              ↔ {languageLabel(rebookCandidate.booking.language_to)}).
            </span>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="panel-soft px-5 py-5">
          <span className="text-3xl font-semibold text-foreground">{pending.length}</span>
          <p className="mt-1 text-sm leading-6 text-muted">Aanvragen in behandeling</p>
        </div>
        <div className="panel-soft px-5 py-5">
          <span className="text-3xl font-semibold text-foreground">{upcoming.length}</span>
          <p className="mt-1 text-sm leading-6 text-muted">Bevestigde/komende opdrachten</p>
        </div>
        <div className="panel-soft px-5 py-5">
          <span className="text-3xl font-semibold text-foreground">{completed.length}</span>
          <p className="mt-1 text-sm leading-6 text-muted">Eerdere opdrachten</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Komende opdrachten</h2>
          <Link href="/klant/opdrachten" className="text-sm font-semibold text-brand-strong">
            Alles bekijken
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">
            Geen komende opdrachten op dit moment.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {upcoming.slice(0, 5).map(({ booking, hasPendingCancellation }) => (
              <Link
                key={booking.booking_id}
                href={`/klant/opdrachten/${booking.booking_id}`}
                className="content-card block px-5 py-4 transition hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-brand-strong">{booking.booking_number}</span>
                  <span className="chip">
                    {getCustomerFacingStatusLabel(booking.status, hasPendingCancellation)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(booking.requested_date)}
                  {booking.requested_start_time ? ` · ${booking.requested_start_time.slice(0, 5)}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {languageLabel(booking.language_from)} ↔ {languageLabel(booking.language_to)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {invoices.length > 0 ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Facturen</h2>
            <Link href="/klant/facturen" className="text-sm font-semibold text-brand-strong">
              Alle facturen
            </Link>
          </div>
          <div className="content-card mt-3 px-5 py-4">
            {openInvoiceCount > 0 ? (
              <p className="text-sm font-medium text-foreground">
                {openInvoiceCount} openstaande {openInvoiceCount === 1 ? "factuur" : "facturen"}
              </p>
            ) : (
              <p className="text-sm font-medium text-foreground">Geen openstaande facturen</p>
            )}
            <ul className="mt-2 divide-y divide-line">
              {latestInvoices.map((invoice) => (
                <li key={invoice.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-muted">{invoice.invoice_number ?? "In voorbereiding"}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-foreground">
                      {formatNumberAsCurrency(invoice.total_inc_vat)}
                    </span>
                    <span className="chip">
                      {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-foreground">Aanvragen in behandeling</h2>
          <div className="mt-3 space-y-3">
            {pending.slice(0, 5).map(({ booking, hasPendingCancellation }) => (
              <Link
                key={booking.booking_id}
                href={`/klant/opdrachten/${booking.booking_id}`}
                className="content-card block px-5 py-4 transition hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-brand-strong">{booking.booking_number}</span>
                  <span className="chip">
                    {getCustomerFacingStatusLabel(booking.status, hasPendingCancellation)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {languageLabel(booking.language_from)} ↔ {languageLabel(booking.language_to)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
