import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listBookings } from "@/lib/bookings/queries";
import { listInterpreters } from "@/lib/interpreters/queries";
import {
  BOOKING_CONTEXTS,
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITIES,
  BOOKING_MODALITY_LABELS,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  isBookingModality,
  isBookingStatus,
  languageLabel,
  type BookingContext,
} from "@/lib/bookings/constants";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatNumberAsCurrency, calculateMarginCents, numberToCents, formatCentsAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  modality?: string;
  context?: string;
  interpreter?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
};

function isBookingContext(value: string): value is BookingContext {
  return (BOOKING_CONTEXTS as readonly string[]).includes(value);
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const status = params.status && isBookingStatus(params.status) ? params.status : undefined;
  const modality = params.modality && isBookingModality(params.modality) ? params.modality : undefined;
  const context = params.context && isBookingContext(params.context) ? params.context : undefined;
  const page = params.page ? Math.max(1, Number(params.page) || 1) : 1;

  const [{ rows, total, pageSize }, interpreters] = await Promise.all([
    listBookings(supabase, {
      status,
      modality,
      context,
      interpreterId: params.interpreter || undefined,
      dateFrom: params.from || undefined,
      dateTo: params.to || undefined,
      search: params.q || undefined,
      page,
    }),
    listInterpreters(supabase),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.modality) search.set("modality", params.modality);
    if (params.context) search.set("context", params.context);
    if (params.interpreter) search.set("interpreter", params.interpreter);
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.q) search.set("q", params.q);
    search.set("page", String(nextPage));
    return `/admin/bookings?${search.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow eyebrow-muted">Beheer</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Boekingen
          </h1>
          <p className="mt-1 text-sm text-muted">{total} resultaten</p>
        </div>
      </div>

      <form
        method="get"
        className="panel-soft grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Zoeken
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={params.q ?? ""}
            placeholder="Boekingnummer, klant, organisatie of e-mail"
            className="form-control mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Alle statussen</option>
            {BOOKING_STATUSES.map((value) => (
              <option key={value} value={value}>
                {BOOKING_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="modality" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Inzetvorm
          </label>
          <select
            id="modality"
            name="modality"
            defaultValue={params.modality ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Alle vormen</option>
            {BOOKING_MODALITIES.map((value) => (
              <option key={value} value={value}>
                {BOOKING_MODALITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="context" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Context
          </label>
          <select
            id="context"
            name="context"
            defaultValue={params.context ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Alle contexten</option>
            {BOOKING_CONTEXTS.map((value) => (
              <option key={value} value={value}>
                {BOOKING_CONTEXT_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="interpreter" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Tolk
          </label>
          <select
            id="interpreter"
            name="interpreter"
            defaultValue={params.interpreter ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Alle tolken</option>
            {interpreters.map((interpreter) => (
              <option key={interpreter.id} value={interpreter.id}>
                {interpreter.first_name} {interpreter.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Datum vanaf
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={params.from ?? ""}
            className="form-control mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="to" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Datum tot
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={params.to ?? ""}
            className="form-control mt-1.5"
          />
        </div>

        <div className="flex items-end gap-2 lg:col-span-4">
          <button type="submit" className="button-primary px-6 py-2.5">
            Filteren
          </button>
          <Link href="/admin/bookings" className="button-secondary px-6 py-2.5">
            Wissen
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="panel-soft px-5 py-8 text-center text-sm text-muted">
          Geen boekingen gevonden voor deze filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Boeking</th>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Taal</th>
                <th className="px-4 py-3">Context</th>
                <th className="px-4 py-3">Vorm</th>
                <th className="px-4 py-3">Tolk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Klantprijs</th>
                <th className="px-4 py-3 text-right">Tolkkosten</th>
                <th className="px-4 py-3 text-right">Marge</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const marginCents = calculateMarginCents({
                  customerPriceCents: numberToCents(row.customer_price_ex_vat),
                  customerTravelFeeCents: numberToCents(
                    row.customer_travel_fee_ex_vat,
                  ),
                  interpreterCostCents: numberToCents(
                    row.interpreter_cost_ex_vat,
                  ),
                  interpreterTravelCostCents: numberToCents(
                    row.interpreter_travel_cost_ex_vat,
                  ),
                });

                return (
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
                      {row.requested_date
                        ? new Date(`${row.requested_date}T00:00:00`).toLocaleDateString("nl-NL")
                        : "—"}
                      {row.requested_start_time
                        ? ` ${row.requested_start_time.slice(0, 5)}`
                        : ""}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {languageLabel(row.language_from)} →{" "}
                      {languageLabel(row.language_to)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {BOOKING_CONTEXT_LABELS[row.context as BookingContext] ?? row.context}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.modality
                        ? BOOKING_MODALITY_LABELS[row.modality as keyof typeof BOOKING_MODALITY_LABELS]
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.interpreter_first_name
                        ? `${row.interpreter_first_name} ${row.interpreter_last_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatNumberAsCurrency(row.customer_price_ex_vat)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatNumberAsCurrency(row.interpreter_cost_ex_vat)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-brand-strong">
                      {formatCentsAsCurrency(marginCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Link
                key={pageNumber}
                href={pageHref(pageNumber)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  pageNumber === page
                    ? "bg-brand-strong text-white"
                    : "border border-line text-muted-strong hover:border-brand/40"
                }`}
              >
                {pageNumber}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
