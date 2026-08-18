import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterLayoutSession } from "@/lib/auth/interpreter";
import { listMyAssignmentOffers, listMyAssignedBookings } from "@/lib/assignments/queries";
import { getInterpreterById } from "@/lib/interpreters/queries";
import { getInterpreterCompleteness } from "@/lib/interpreters/completeness";
import { OfferCard, BookingCard } from "@/components/portal/assignment-card";
import { OnboardingCard } from "@/components/portal/onboarding-card";

export const dynamic = "force-dynamic";

function Section({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode[];
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children.length === 0 ? (
        <p className="panel-soft mt-3 px-4 py-5 text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="mt-3 space-y-3">{children}</div>
      )}
    </section>
  );
}

export default async function InterpreterDashboardPage() {
  const session = await requireInterpreterLayoutSession();
  const supabase = await createClient();

  if (session.status !== "authorized") {
    return null;
  }

  const [offers, assignedBookings, interpreter] = await Promise.all([
    listMyAssignmentOffers(supabase),
    listMyAssignedBookings(supabase),
    getInterpreterById(supabase, session.interpreter.id),
  ]);

  const completeness = interpreter
    ? getInterpreterCompleteness(interpreter, interpreter.interpreter_languages.length)
    : null;

  const newInvitations = offers.filter((o) => o.status === "invited");
  const openForMe = offers.filter((o) => o.status === "viewed" && o.assignment_type === "open");
  const interested = offers.filter((o) => o.status === "interested");
  const upcoming = assignedBookings.filter((b) =>
    ["interpreter_confirmed", "confirmed"].includes(b.status),
  );
  const completed = assignedBookings.filter((b) => b.status === "completed").slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow eyebrow-muted">Tolkenportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welkom, {session.interpreter.first_name}
        </h1>
      </div>

      {completeness ? <OnboardingCard completeness={completeness} /> : null}

      <Section title="Nieuwe uitnodigingen" emptyText="Geen nieuwe uitnodigingen.">
        {newInvitations.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </Section>

      <Section title="Open opdrachten" emptyText="Geen open opdrachten voor u op dit moment.">
        {openForMe.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </Section>

      <Section title="Interesse getoond" emptyText="U heeft nog nergens interesse in getoond.">
        {interested.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </Section>

      <Section title="Aankomende bevestigde opdrachten" emptyText="Nog geen bevestigde opdrachten.">
        {upcoming.map((booking) => (
          <BookingCard key={booking.booking_id} booking={booking} />
        ))}
      </Section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent afgerond</h2>
          <Link href="/tolk/opdrachten" className="text-sm font-semibold text-brand-strong">
            Alles bekijken
          </Link>
        </div>
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
    </div>
  );
}
