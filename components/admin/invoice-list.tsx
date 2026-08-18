import Link from "next/link";
import { formatNumberAsCurrency } from "@/lib/money";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/invoices/constants";
import type { InvoiceSummaryRow } from "@/lib/invoices/queries";

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  issued: "bg-sky-100 text-sky-900 border-sky-300",
  sent: "bg-amber-100 text-amber-900 border-amber-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

/**
 * The one place invoice summaries render as a list - reused by the
 * customer detail page (all of a customer's invoices) and the booking
 * detail page (invoices linked to that one booking), so the two never grow
 * duplicated, drifting markup.
 */
export function InvoiceList({
  invoices,
  emptyText,
}: {
  invoices: InvoiceSummaryRow[];
  emptyText: string;
}) {
  if (invoices.length === 0) {
    return <p className="mt-3 text-sm text-muted">{emptyText}</p>;
  }

  return (
    <ul className="mt-4 divide-y divide-line">
      {invoices.map((invoice) => {
        const status = invoice.status as InvoiceStatus;

        return (
          <li key={invoice.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <Link
                href={`/admin/invoices/${invoice.id}`}
                className="text-sm font-semibold text-brand-strong hover:underline"
              >
                {invoice.invoice_number ?? "Concept"}
              </Link>
              <p className="mt-0.5 text-xs text-muted">
                {formatNumberAsCurrency(invoice.total_inc_vat)}
                {invoice.due_date
                  ? ` · vervalt ${new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString("nl-NL")}`
                  : ""}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? ""}`}
            >
              {INVOICE_STATUS_LABELS[status] ?? invoice.status}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
