import { createClient } from "@/lib/supabase/server";
import { listMyAssignmentOffers, listMyAssignedBookings } from "@/lib/assignments/queries";
import { OfferCard, BookingCard } from "@/components/portal/assignment-card";

export const dynamic = "force-dynamic";

export default async function InterpreterAssignmentsPage() {
  const supabase = await createClient();
  const [offers, assignedBookings] = await Promise.all([
    listMyAssignmentOffers(supabase),
    listMyAssignedBookings(supabase),
  ]);

  const active = offers.filter((o) => ["invited", "viewed", "interested"].includes(o.status));
  const upcoming = assignedBookings.filter((b) =>
    ["interpreter_confirmed", "confirmed"].includes(b.status),
  );
  // 'customer_invoiced'/'paid' are post-completion booking statuses (see
  // lib/customers/portal-status.ts) reached once the *customer's* invoice
  // progresses - bug fix: these used to fall through every bucket here,
  // silently disappearing from the interpreter's own portal even though
  // bookings.interpreter_id (and their settlement) was still correctly
  // theirs.
  const completed = assignedBookings.filter((b) =>
    ["completed", "customer_invoiced", "paid"].includes(b.status),
  );
  const cancelled = assignedBookings.filter((b) => b.status === "cancelled");
  const notSelected = offers.filter((o) =>
    ["declined", "rejected", "withdrawn", "expired"].includes(o.status),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow eyebrow-muted">Tolkenportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Opdrachten</h1>
      </div>

      <section>
        <h2 className="text-base font-semibold text-foreground">
          Openstaand ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">
            Geen openstaande uitnodigingen of open opdrachten.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {active.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">
          Bevestigd ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">
            Geen bevestigde opdrachten.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {upcoming.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">
          Afgerond ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">
            Nog geen afgeronde opdrachten.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {completed.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      {cancelled.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-foreground">
            Geannuleerd ({cancelled.length})
          </h2>
          <div className="mt-3 space-y-3">
            {cancelled.map((booking) => (
              <BookingCard key={booking.booking_id} booking={booking} />
            ))}
          </div>
        </section>
      ) : null}

      {notSelected.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-foreground">
            Niet doorgegaan ({notSelected.length})
          </h2>
          <div className="mt-3 space-y-3">
            {notSelected.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
