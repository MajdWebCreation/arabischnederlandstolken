import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listInterpreterInvoices } from "@/lib/interpreter-invoices/queries";
import {
  INTERPRETER_INVOICE_STATUSES,
  INTERPRETER_INVOICE_STATUS_LABELS,
  isInterpreterInvoiceStatus,
  type InterpreterInvoiceStatus,
} from "@/lib/interpreter-invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string; q?: string };

const statusStyles: Record<InterpreterInvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  pending_review: "bg-amber-100 text-amber-900 border-amber-300",
  change_requested: "bg-red-100 text-red-900 border-red-300",
  approved: "bg-sky-100 text-sky-900 border-sky-300",
  issued: "bg-blue-100 text-blue-900 border-blue-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

function InterpreterInvoiceStatusBadge({ status }: { status: string }) {
  const knownStatus = isInterpreterInvoiceStatus(status) ? status : null;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        knownStatus ? statusStyles[knownStatus] : "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {knownStatus ? INTERPRETER_INVOICE_STATUS_LABELS[knownStatus] : status}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("nl-NL");
}

export default async function AdminInterpreterInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const status =
    params.status && isInterpreterInvoiceStatus(params.status) ? params.status : undefined;

  const invoices = await listInterpreterInvoices(supabase, {
    status,
    search: params.q || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow eyebrow-muted">Beheer</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Tolkenfacturen
          </h1>
          <p className="mt-1 text-sm text-muted">
            Self-billing afrekeningen/facturen van tolken aan Arabisch Nederlands Tolken.{" "}
            {invoices.length} resultaten
          </p>
        </div>
      </div>

      <form method="get" className="panel-soft grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Zoeken
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={params.q ?? ""}
            placeholder="Factuurnummer, tolk of boeking"
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
            {INTERPRETER_INVOICE_STATUSES.filter((value) => value !== "draft").map((value) => (
              <option key={value} value={value}>
                {INTERPRETER_INVOICE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="button-primary px-6 py-2.5">
            Filteren
          </button>
          <Link href="/admin/interpreter-invoices" className="button-secondary px-6 py-2.5">
            Wissen
          </Link>
        </div>
      </form>

      {invoices.length === 0 ? (
        <p className="panel-soft px-5 py-8 text-center text-sm text-muted">
          Geen tolkenfacturen gevonden voor deze filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Factuur</th>
                <th className="px-4 py-3">Tolk</th>
                <th className="px-4 py-3">Boeking</th>
                <th className="px-4 py-3">Opdrachtdatum</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-line last:border-0 hover:bg-surface-alt/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/interpreter-invoices/${invoice.id}`}
                      className="font-semibold text-brand-strong hover:underline"
                    >
                      {invoice.invoice_number ?? "Concept"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {invoice.interpreter
                      ? `${invoice.interpreter.first_name} ${invoice.interpreter.last_name}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{invoice.booking?.booking_number ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(invoice.booking?.requested_date ?? null)}</td>
                  <td className="px-4 py-3">
                    <InterpreterInvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">
                    {formatNumberAsCurrency(invoice.total_inc_vat)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
