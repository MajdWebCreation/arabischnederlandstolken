import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getInterpreterInvoiceById,
  getInterpreterInvoiceEvents,
} from "@/lib/interpreter-invoices/queries";
import {
  INTERPRETER_INVOICE_STATUS_LABELS,
  INTERPRETER_INVOICE_EVENT_TYPE_LABELS,
  isInterpreterInvoiceStatus,
  isInterpreterInvoiceEditable,
} from "@/lib/interpreter-invoices/constants";
import { INTERPRETER_VAT_TREATMENTS, INTERPRETER_VAT_TREATMENT_LABELS } from "@/lib/interpreters/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import { languageLabel, BOOKING_MODALITY_LABELS, type BookingModality } from "@/lib/bookings/constants";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  updateInterpreterInvoiceVat,
  submitInterpreterSettlementForReview,
  issueInterpreterInvoiceAction,
  markInterpreterInvoicePaidAction,
  cancelInterpreterInvoiceAction,
} from "@/app/admin/(dashboard)/interpreter-invoices/[id]/actions";
import {
  InterpreterItemEditRow,
  AddInterpreterItemForm,
} from "@/app/admin/(dashboard)/interpreter-invoices/[id]/item-forms";

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

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL");
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  pending_review: "bg-amber-100 text-amber-900 border-amber-300",
  change_requested: "bg-red-100 text-red-900 border-red-300",
  approved: "bg-sky-100 text-sky-900 border-sky-300",
  issued: "bg-blue-100 text-blue-900 border-blue-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

export default async function AdminInterpreterInvoiceDetailPage({
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
    getInterpreterInvoiceById(supabase, id),
    getInterpreterInvoiceEvents(supabase, id),
  ]);

  if (!invoice) {
    notFound();
  }

  const status = isInterpreterInvoiceStatus(invoice.status) ? invoice.status : "draft";
  const editable = isInterpreterInvoiceEditable(status);
  const hasNoItems = invoice.items.length === 0;
  const canSubmit = editable;
  const canIssue = status === "approved";
  const canMarkPaid = status === "issued";
  const canCancel = status === "draft" || status === "pending_review" || status === "change_requested" || status === "approved";

  const interpreterProfileIncomplete =
    !invoice.interpreter.legal_business_name?.trim() ||
    !invoice.interpreter.business_street?.trim() ||
    !invoice.interpreter.business_house_number?.trim() ||
    !invoice.interpreter.business_postal_code?.trim() ||
    !invoice.interpreter.business_city?.trim() ||
    !invoice.interpreter.iban?.trim() ||
    !invoice.interpreter.account_holder_name?.trim();
  const selfBillingMissing = !invoice.interpreter.self_billing_accepted_at;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/interpreter-invoices"
            className="text-sm font-medium text-muted hover:text-brand-strong"
          >
            ← Alle tolkenfacturen
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {invoice.invoice_number ?? "Conceptafrekening"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? ""}`}
            >
              {INTERPRETER_INVOICE_STATUS_LABELS[status]}
            </span>
            <Link
              href={`/admin/interpreters/${invoice.interpreter.id}`}
              className="chip hover:bg-brand-soft"
            >
              {invoice.interpreter.first_name} {invoice.interpreter.last_name}
            </Link>
            <Link href={`/admin/bookings/${invoice.booking.id}`} className="chip hover:bg-brand-soft">
              Boeking {invoice.booking.booking_number}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === "issued" || status === "paid" ? (
            <a
              href={`/admin/interpreter-invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="button-secondary px-5 py-2.5"
            >
              PDF bekijken
            </a>
          ) : null}
        </div>
      </div>

      {editable && (interpreterProfileIncomplete || selfBillingMissing) ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">
            Deze afrekening kan nog niet naar de tolk worden gestuurd
          </p>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-amber-900">
            {selfBillingMissing ? <li>De tolk heeft de self-billing overeenkomst nog niet geaccepteerd.</li> : null}
            {interpreterProfileIncomplete ? (
              <li>
                Zakelijke of betaalgegevens van de tolk ontbreken.{" "}
                <Link
                  href={`/admin/interpreters/${invoice.interpreter.id}`}
                  className="font-semibold underline decoration-amber-500/50 underline-offset-4"
                >
                  Tolkgegevens bekijken
                </Link>
              </li>
            ) : null}
            {hasNoItems ? <li>Nog geen regels toegevoegd.</li> : null}
          </ul>
        </div>
      ) : null}

      {invoice.last_change_request_message ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-900">Wijziging aangevraagd door de tolk</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-red-900">
            {invoice.last_change_request_message}
          </p>
        </div>
      ) : null}

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Opdracht</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Datum</dt>
            <dd className="mt-1 text-sm text-foreground">{formatDate(invoice.booking.requested_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Inzetvorm</dt>
            <dd className="mt-1 text-sm text-foreground">
              {invoice.booking.modality
                ? BOOKING_MODALITY_LABELS[invoice.booking.modality as BookingModality]
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Taalrichting</dt>
            <dd className="mt-1 text-sm text-foreground">
              {languageLabel(invoice.booking.language_from)} → {languageLabel(invoice.booking.language_to)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Werkelijke duur
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {invoice.booking.actual_duration_minutes
                ? `${invoice.booking.actual_duration_minutes} min.`
                : "Nog niet bevestigd"}
              {invoice.booking.expected_duration_minutes
                ? ` (gepland: ${invoice.booking.expected_duration_minutes} min.)`
                : ""}
            </dd>
          </div>
        </dl>
        {!invoice.booking.actual_duration_minutes ? (
          <p className="mt-3 text-xs text-amber-800">
            Bevestig de werkelijke duur bij de boekingsgegevens voordat u de afrekening verstuurt.
          </p>
        ) : null}
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Regels</h2>

        {editable ? (
          <div className="mt-4 space-y-3">
            {invoice.items.map((item) => (
              <InterpreterItemEditRow
                key={item.id}
                item={item}
                invoiceId={invoice.id}
                bookingId={invoice.booking.id}
              />
            ))}
            <AddInterpreterItemForm invoiceId={invoice.id} bookingId={invoice.booking.id} />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Omschrijving</th>
                  <th className="px-4 py-3 text-right">Aantal</th>
                  <th className="px-4 py-3 text-right">Prijs</th>
                  <th className="px-4 py-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {Number(item.quantity)}
                      {item.unit ? ` ${item.unit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {formatNumberAsCurrency(item.unit_price_ex_vat)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {formatNumberAsCurrency(item.amount_ex_vat)}
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
              {formatNumberAsCurrency(invoice.vat_amount)}
            </span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
            <span className="text-brand-strong">Totaal</span>
            <span className="tabular-nums text-brand-strong">
              {formatNumberAsCurrency(invoice.total_inc_vat)}
            </span>
          </div>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Btw-behandeling</h2>
        <p className="mt-1 text-xs text-muted">
          Gebaseerd op de door de tolk opgegeven fiscale instelling
          ({invoice.interpreter.vat_treatment
            ? INTERPRETER_VAT_TREATMENT_LABELS[
                invoice.interpreter.vat_treatment as keyof typeof INTERPRETER_VAT_TREATMENT_LABELS
              ]
            : "nog niet opgegeven"}
          ). Controleer voordat u verstuurt.
        </p>

        {editable ? (
          <div className="mt-4">
            <AdminActionForm
              action={updateInterpreterInvoiceVat.bind(null, invoice.id, invoice.booking.id)}
              submitLabel="Btw-gegevens opslaan"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="vatTreatment"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Btw-behandeling
                  </label>
                  <select
                    id="vatTreatment"
                    name="vatTreatment"
                    defaultValue={invoice.vat_treatment_snapshot ?? ""}
                    required
                    className="form-control mt-1.5"
                  >
                    <option value="" disabled>
                      Kies…
                    </option>
                    {INTERPRETER_VAT_TREATMENTS.map((value) => (
                      <option key={value} value={value}>
                        {INTERPRETER_VAT_TREATMENT_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="vatRate"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Btw-tarief % (bij reguliere btw)
                  </label>
                  <input
                    id="vatRate"
                    name="vatRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={invoice.vat_rate !== null ? Number(invoice.vat_rate) : 21}
                    className="form-control mt-1.5"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="fiscalNote"
                    className="text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Fiscale toelichting (verplicht bij &ldquo;geen btw&rdquo; of &ldquo;anders&rdquo;)
                  </label>
                  <textarea
                    id="fiscalNote"
                    name="fiscalNote"
                    rows={2}
                    defaultValue={invoice.fiscal_note ?? ""}
                    className="form-control mt-1.5"
                  />
                </div>
              </div>
            </AdminActionForm>
          </div>
        ) : (
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Behandeling</dt>
              <dd className="mt-1 text-sm text-foreground">
                {invoice.vat_treatment_snapshot
                  ? INTERPRETER_VAT_TREATMENT_LABELS[
                      invoice.vat_treatment_snapshot as keyof typeof INTERPRETER_VAT_TREATMENT_LABELS
                    ]
                  : "—"}
              </dd>
            </div>
            {invoice.vat_rate !== null ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Tarief</dt>
                <dd className="mt-1 text-sm text-foreground">{Number(invoice.vat_rate)}%</dd>
              </div>
            ) : null}
            {invoice.fiscal_note ? (
              <div className="sm:col-span-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Toelichting</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">{invoice.fiscal_note}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Acties</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {canSubmit ? (
            <AdminActionForm
              action={submitInterpreterSettlementForReview.bind(null, invoice.id, invoice.booking.id)}
              submitLabel="Naar tolk sturen"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canIssue ? (
            <AdminActionForm
              action={issueInterpreterInvoiceAction.bind(null, invoice.id, invoice.booking.id)}
              submitLabel="Officiële factuur uitgeven"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canMarkPaid ? (
            <AdminActionForm
              action={markInterpreterInvoicePaidAction.bind(null, invoice.id, invoice.booking.id)}
              submitLabel="Markeer als betaald"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}

          {canCancel ? (
            <AdminActionForm
              action={cancelInterpreterInvoiceAction.bind(null, invoice.id, invoice.booking.id)}
              submitLabel="Afrekening annuleren"
              pendingLabel="Bezig…"
            >
              <></>
            </AdminActionForm>
          ) : null}
        </div>
        {invoice.interpreter_approved_at ? (
          <p className="mt-3 text-xs text-muted">
            Tolk akkoord op {formatDateTime(invoice.interpreter_approved_at)} (voorwaarden-versie{" "}
            {invoice.self_billing_terms_version}).
          </p>
        ) : null}
        {invoice.issued_at ? (
          <p className="mt-1 text-xs text-muted">Definitief gemaakt op {formatDateTime(invoice.issued_at)}.</p>
        ) : null}
        {invoice.paid_at ? (
          <p className="mt-1 text-xs text-muted">Betaald op {formatDateTime(invoice.paid_at)}.</p>
        ) : null}
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Geschiedenis</h2>
        <ol className="mt-4 space-y-4">
          {events.map((event) => (
            <li key={event.id} className="border-s-2 border-brand/25 ps-4">
              <p className="text-sm font-semibold text-foreground">
                {INTERPRETER_INVOICE_EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
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
