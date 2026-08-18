import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listInvoices } from "@/lib/invoices/queries";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  isInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
};

const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  issued: "bg-sky-100 text-sky-900 border-sky-300",
  sent: "bg-amber-100 text-amber-900 border-amber-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const knownStatus = isInvoiceStatus(status) ? status : null;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        knownStatus ? invoiceStatusStyles[knownStatus] : "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {knownStatus ? INVOICE_STATUS_LABELS[knownStatus] : status}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL");
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const status = params.status && isInvoiceStatus(params.status) ? params.status : undefined;

  const invoices = await listInvoices(supabase, {
    status,
    search: params.q || undefined,
    dateFrom: params.from || undefined,
    dateTo: params.to || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow eyebrow-muted">Beheer</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Facturen
          </h1>
          <p className="mt-1 text-sm text-muted">{invoices.length} resultaten</p>
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
            placeholder="Factuurnummer, klant of organisatie"
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
            {INVOICE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {INVOICE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="from" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Aangemaakt vanaf
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
            Aangemaakt tot
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
          <Link href="/admin/invoices" className="button-secondary px-6 py-2.5">
            Wissen
          </Link>
        </div>
      </form>

      {invoices.length === 0 ? (
        <p className="panel-soft px-5 py-8 text-center text-sm text-muted">
          Geen facturen gevonden voor deze filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Factuur</th>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">Factuurdatum</th>
                <th className="px-4 py-3">Vervaldatum</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-line last:border-0 hover:bg-surface-alt/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      className="font-semibold text-brand-strong hover:underline"
                    >
                      {invoice.invoice_number ?? "Concept"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {invoice.customer?.name ?? "—"}
                    </div>
                    {invoice.customer?.organisation ? (
                      <div className="text-xs text-muted">{invoice.customer.organisation}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(invoice.invoice_date)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(invoice.due_date)}</td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
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
