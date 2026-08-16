import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardCounts,
  listUpcomingBookings,
  listBookings,
} from "@/lib/bookings/queries";
import { StatusBadge } from "@/components/admin/status-badge";
import { languageLabel } from "@/lib/bookings/constants";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Geen datum";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [counts, upcoming, actionable] = await Promise.all([
    getDashboardCounts(supabase),
    listUpcomingBookings(supabase, 6),
    listBookings(supabase, {
      status: undefined,
      pageSize: 8,
    }),
  ]);

  const needsAttention = actionable.rows.filter((row) =>
    ["new", "interpreter_search", "quoted"].includes(row.status),
  );

  const stats = [
    { label: "Nieuwe aanvragen", value: counts.newRequests, href: "/admin/bookings?status=new" },
    { label: "Tolk zoeken", value: counts.interpreterSearch, href: "/admin/bookings?status=interpreter_search" },
    { label: "Aankomend bevestigd", value: counts.upcomingConfirmed, href: "/admin/bookings?status=confirmed" },
    { label: "Totaal nog te gaan", value: counts.totalUpcoming, href: "/admin/bookings" },
    { label: "Afgerond (totaal)", value: counts.completed, href: "/admin/bookings?status=completed" },
    { label: "Afgerond, nog niet gefactureerd", value: counts.completedNotInvoiced, href: "/admin/bookings?status=completed" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow eyebrow-muted">Beheeromgeving</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Overzicht
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          Operationeel overzicht van tolkaanvragen. Interpretatievergoedingen
          en marges zijn alleen hier zichtbaar, nooit publiek.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="panel-soft flex flex-col gap-1 px-5 py-5 transition hover:border-brand/40"
          >
            <span className="text-3xl font-semibold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm leading-6 text-muted">{stat.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Vraagt actie
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4"
          >
            Alle boekingen
          </Link>
        </div>

        {needsAttention.length === 0 ? (
          <p className="panel-soft mt-4 px-5 py-6 text-sm text-muted">
            Niets dat op dit moment actie vereist.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Boeking</th>
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Taal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ontvangen</th>
                </tr>
              </thead>
              <tbody>
                {needsAttention.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0 hover:bg-surface-alt/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${row.id}`}
                        className="font-semibold text-brand-strong hover:underline"
                      >
                        {row.booking_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {row.customer_name}
                      </div>
                      {row.customer_organisation ? (
                        <div className="text-xs text-muted">
                          {row.customer_organisation}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {languageLabel(row.language_from)} →{" "}
                      {languageLabel(row.language_to)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(row.created_at).toLocaleDateString("nl-NL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Aankomende bevestigde boekingen
        </h2>

        {upcoming.length === 0 ? (
          <p className="panel-soft mt-4 px-5 py-6 text-sm text-muted">
            Geen aankomende bevestigde boekingen.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((row) => (
              <Link
                key={row.id}
                href={`/admin/bookings/${row.id}`}
                className="content-card px-5 py-5 transition hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-brand-strong">
                    {row.booking_number}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {row.customer_name}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(row.requested_date)}
                  {row.requested_start_time
                    ? ` · ${row.requested_start_time.slice(0, 5)}`
                    : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {languageLabel(row.language_from)} →{" "}
                  {languageLabel(row.language_to)}
                  {row.interpreter_first_name
                    ? ` · ${row.interpreter_first_name} ${row.interpreter_last_name}`
                    : " · nog geen tolk toegewezen"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
