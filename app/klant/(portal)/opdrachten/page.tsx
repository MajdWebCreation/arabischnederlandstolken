import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMyCustomerBookings, listCancellationRequestsForMyBooking } from "@/lib/customers/portal-queries";
import { getCustomerBookingGroup, getCustomerFacingStatusLabel } from "@/lib/customers/portal-status";
import { languageLabel } from "@/lib/bookings/constants";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Datum nog niet bekend";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CustomerBookingsPage() {
  const supabase = await createClient();
  const bookings = await listMyCustomerBookings(supabase);

  const withPendingFlags = await Promise.all(
    bookings.map(async (booking) => {
      const requests = await listCancellationRequestsForMyBooking(supabase, booking.booking_id);
      return { booking, hasPendingCancellation: requests.some((r) => r.status === "pending") };
    }),
  );

  const groups = {
    pending: withPendingFlags.filter(
      (r) => getCustomerBookingGroup(r.booking.status, r.hasPendingCancellation) === "pending",
    ),
    upcoming: withPendingFlags.filter(
      (r) => getCustomerBookingGroup(r.booking.status, r.hasPendingCancellation) === "upcoming",
    ),
    completed: withPendingFlags.filter(
      (r) => getCustomerBookingGroup(r.booking.status, r.hasPendingCancellation) === "completed",
    ),
    cancelled: withPendingFlags.filter(
      (r) => getCustomerBookingGroup(r.booking.status, r.hasPendingCancellation) === "cancelled",
    ),
  };

  const sections: Array<{ key: keyof typeof groups; title: string; emptyText: string }> = [
    { key: "pending", title: "In behandeling", emptyText: "Geen aanvragen in behandeling." },
    { key: "upcoming", title: "Bevestigd / komend", emptyText: "Geen bevestigde opdrachten." },
    { key: "completed", title: "Afgerond", emptyText: "Nog geen afgeronde opdrachten." },
    { key: "cancelled", title: "Geannuleerd", emptyText: "" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow eyebrow-muted">Klantportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Opdrachten</h1>
      </div>

      {sections.map((section) => {
        const rows = groups[section.key];
        if (section.key === "cancelled" && rows.length === 0) return null;

        return (
          <section key={section.key}>
            <h2 className="text-base font-semibold text-foreground">
              {section.title} ({rows.length})
            </h2>
            {rows.length === 0 ? (
              <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">{section.emptyText}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {rows.map(({ booking, hasPendingCancellation }) => (
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
        );
      })}
    </div>
  );
}
