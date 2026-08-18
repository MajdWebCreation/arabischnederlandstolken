import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMyCustomerInvoices } from "@/lib/customers/portal-queries";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  issued: "bg-sky-100 text-sky-900 border-sky-300",
  sent: "bg-amber-100 text-amber-900 border-amber-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CustomerInvoicesPage() {
  const supabase = await createClient();
  const invoices = await listMyCustomerInvoices(supabase);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Klantportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Facturen</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Al uw facturen van Arabisch Nederlands Tolken, inclusief eerdere
          opdrachten.
        </p>
      </div>

      {invoices.length === 0 ? (
        <p className="panel-soft px-4 py-6 text-sm text-muted">
          Nog geen facturen.
        </p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const status = invoice.status as InvoiceStatus;
            const dueDate = formatDate(invoice.due_date);

            return (
              <div key={invoice.id} className="content-card px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {invoice.invoice_number ?? "In voorbereiding"}
                    </p>
                    {invoice.booking_number ? (
                      <Link
                        href={`/klant/opdrachten/${invoice.booking_id}`}
                        className="mt-0.5 inline-block text-xs font-medium text-brand-strong hover:underline"
                      >
                        Opdracht {invoice.booking_number}
                      </Link>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? ""}`}
                  >
                    {INVOICE_STATUS_LABELS[status] ?? invoice.status}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Factuurdatum
                    </dt>
                    <dd className="mt-0.5 text-foreground">
                      {formatDate(invoice.invoice_date) ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Vervaldatum
                    </dt>
                    <dd className="mt-0.5 text-foreground">{dueDate ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Totaal incl. btw
                    </dt>
                    <dd className="mt-0.5 font-semibold text-brand-strong">
                      {formatNumberAsCurrency(invoice.total_inc_vat)}
                    </dd>
                  </div>
                </dl>

                <a
                  href={`/klant/facturen/${invoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-tertiary mt-4 inline-flex px-4 py-2 text-sm"
                >
                  Bekijk factuur
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
