import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceById, getInvoiceEvents } from "@/lib/invoices/queries";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_EVENT_TYPE_LABELS,
  isInvoiceStatus,
} from "@/lib/invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  updateInvoiceHeader,
  issueInvoiceAction,
  sendInvoiceAction,
  markInvoicePaidAction,
  revertInvoicePaymentAction,
  cancelInvoiceAction,
} from "@/app/admin/(dashboard)/invoices/[id]/actions";
import { ItemEditRow, AddItemForm } from "@/app/admin/(dashboard)/invoices/[id]/item-forms";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  issued: "bg-sky-100 text-sky-900 border-sky-300",
  sent: "bg-amber-100 text-amber-900 border-amber-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const [invoice, events] = await Promise.all([
    getInvoiceById(supabase, id),
    getInvoiceEvents(supabase, id),
  ]);

  if (!invoice) {
    notFound();
  }

  const status = isInvoiceStatus(invoice.status) ? invoice.status : "draft";
  const isDraft = status === "draft";
  const missingBillingAddress =
    !invoice.customer.billing_street?.trim() ||
    !invoice.customer.billing_house_number?.trim() ||
    !invoice.customer.billing_postal_code?.trim() ||
    !invoice.customer.billing_city?.trim();
  const hasNoItems = invoice.items.length === 0;
  const canIssue = isDraft;
  const canSend = status === "issued" || status === "sent" || status === "paid";
  const canMarkPaid = status === "issued" || status === "sent";
  const canRevertPaid = status === "paid";
  const canCancel = status === "draft" || status === "issued" || status === "sent";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/invoices"
            className="text-sm font-medium text-muted hover:text-brand-strong"
          >
            ← Alle facturen
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {invoice.invoice_number ?? "Conceptfactuur"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? ""}`}
            >
              {INVOICE_STATUS_LABELS[status]}
            </span>
            <Link
              href={`/admin/customers/${invoice.customer.id}`}
              className="chip hover:bg-brand-soft"
            >
              {invoice.customer.name}
            </Link>
            {invoice.booking ? (
              <Link href={`/admin/bookings/${invoice.booking.id}`} className="chip hover:bg-brand-soft">
                Boeking {invoice.booking.booking_number}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="button-secondary px-5 py-2.5"
          >
            {isDraft ? "PDF-voorbeeld" : "PDF bekijken"}
          </a>
        </div>
      </div>

      {isDraft && (missingBillingAddress || hasNoItems) ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">
            Factuur kan nog niet definitief worden gemaakt
          </p>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-amber-900">
            {missingBillingAddress ? (
              <li>
                Factuuradres ontbreekt bij de klant.{" "}
                <Link
                  href={`/admin/customers/${invoice.customer.id}`}
                  className="font-semibold underline decoration-amber-500/50 underline-offset-4"
                >
                  Klantgegevens bijwerken
                </Link>
              </li>
            ) : null}
            {hasNoItems ? <li>Nog geen factuurregels toegevoegd.</li> : null}
          </ul>
        </div>
      ) : null}

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Factuurgegevens</h2>

        {isDraft ? (
          <div className="mt-4">
            <AdminActionForm
              action={updateInvoiceHeader.bind(null, invoice.id)}
              submitLabel="Factuurgegevens opslaan"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="invoiceDate"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Factuurdatum
                  </label>
                  <input
                    id="invoiceDate"
                    name="invoiceDate"
                    type="date"
                    defaultValue={invoice.invoice_date ?? ""}
                    className="form-control mt-1.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dueDate"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Vervaldatum
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={invoice.due_date ?? ""}
                    className="form-control mt-1.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="paymentTermDays"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Betalingstermijn (dagen)
                  </label>
                  <input
                    id="paymentTermDays"
                    name="paymentTermDays"
                    type="number"
                    min={1}
                    defaultValue={invoice.payment_term_days}
                    className="form-control mt-1.5"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="customerNote"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Opmerking voor klant (optioneel)
                  </label>
                  <textarea
                    id="customerNote"
                    name="customerNote"
                    rows={2}
                    defaultValue={invoice.customer_note ?? ""}
                    className="form-control mt-1.5"
                  />
                </div>
              </div>
            </AdminActionForm>
          </div>
        ) : (
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Factuurdatum</dt>
              <dd className="mt-1 text-sm text-foreground">
                {invoice.invoice_date
                  ? new Date(`${invoice.invoice_date}T00:00:00`).toLocaleDateString("nl-NL")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Vervaldatum</dt>
              <dd className="mt-1 text-sm text-foreground">
                {invoice.due_date
                  ? new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString("nl-NL")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Betalingstermijn</dt>
              <dd className="mt-1 text-sm text-foreground">{invoice.payment_term_days} dagen</dd>
            </div>
            {invoice.customer_note ? (
              <div className="sm:col-span-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Opmerking</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {invoice.customer_note}
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Factuurregels</h2>

        {isDraft ? (
          <div className="mt-4 space-y-3">
            {invoice.items.map((item) => (
              <ItemEditRow key={item.id} item={item} invoiceId={invoice.id} />
            ))}
            <AddItemForm invoiceId={invoice.id} />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Omschrijving</th>
                  <th className="px-4 py-3 text-right">Aantal</th>
                  <th className="px-4 py-3 text-right">Prijs</th>
                  <th className="px-4 py-3 text-right">Btw</th>
                  <th className="px-4 py-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {Number(item.quantity)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {formatNumberAsCurrency(item.unit_price_ex_vat)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {Number(item.vat_rate)}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatNumberAsCurrency(item.line_subtotal_ex_vat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 ms-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotaal excl. btw</span>
            <span className="tabular-nums text-foreground">
              {formatNumberAsCurrency(invoice.subtotal_ex_vat)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Btw</span>
            <span className="tabular-nums text-foreground">
              {formatNumberAsCurrency(invoice.total_vat)}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
            <span className="text-brand-strong">Totaal incl. btw</span>
            <span className="tabular-nums text-brand-strong">
              {formatNumberAsCurrency(invoice.total_inc_vat)}
            </span>
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Acties</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {canIssue ? (
            <AdminActionForm
              action={issueInvoiceAction.bind(null, invoice.id)}
              submitLabel="Definitief maken"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canSend ? (
            <AdminActionForm
              action={sendInvoiceAction.bind(null, invoice.id)}
              submitLabel={status === "sent" || status === "paid" ? "Opnieuw verzenden" : "Factuur verzenden"}
              pendingLabel="Verzenden…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canMarkPaid ? (
            <AdminActionForm
              action={markInvoicePaidAction.bind(null, invoice.id)}
              submitLabel="Markeer als betaald"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canRevertPaid ? (
            <AdminActionForm
              action={revertInvoicePaymentAction.bind(null, invoice.id)}
              submitLabel="Betaalmarkering ongedaan maken"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canCancel ? (
            <AdminActionForm
              action={cancelInvoiceAction.bind(null, invoice.id)}
              submitLabel="Factuur annuleren"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}
        </div>
        {invoice.sent_at ? (
          <p className="mt-3 text-xs text-muted">
            Laatst verzonden op {formatDateTime(invoice.sent_at)} naar {invoice.sent_to_email}.
          </p>
        ) : null}
        {invoice.paid_at ? (
          <p className="mt-1 text-xs text-muted">Betaald op {formatDateTime(invoice.paid_at)}.</p>
        ) : null}
        {invoice.mollie_payment_url ? (
          <p className="mt-1 text-xs text-muted">
            Mollie-betaallink
            {invoice.mollie_payment_link_mode ? (
              <span
                className={`ms-1.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  invoice.mollie_payment_link_mode === "live"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              >
                {invoice.mollie_payment_link_mode}
              </span>
            ) : null}
            :{" "}
            <a
              href={invoice.mollie_payment_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              {invoice.mollie_payment_url}
            </a>
            {invoice.mollie_payment_link_created_at
              ? ` (aangemaakt op ${formatDateTime(invoice.mollie_payment_link_created_at)})`
              : ""}
          </p>
        ) : null}
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Geschiedenis</h2>
        <ol className="mt-4 space-y-4">
          {events.map((event) => (
            <li key={event.id} className="border-s-2 border-brand/25 ps-4">
              <p className="text-sm font-semibold text-foreground">
                {INVOICE_EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
              </p>
              {event.description ? (
                <p className="mt-0.5 text-sm text-muted">{event.description}</p>
              ) : null}
              <p className="mt-0.5 text-xs text-muted">{formatDateTime(event.created_at)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
