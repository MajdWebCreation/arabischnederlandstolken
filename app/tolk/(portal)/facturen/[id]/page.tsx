import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMyInterpreterInvoice,
  listMyInterpreterInvoiceItems,
} from "@/lib/interpreter-invoices/queries";
import {
  INTERPRETER_INVOICE_STATUS_LABELS,
  isInterpreterInvoiceStatus,
} from "@/lib/interpreter-invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import { languageLabel, BOOKING_MODALITY_LABELS, type BookingModality } from "@/lib/bookings/constants";
import { SettlementReviewActions } from "@/app/tolk/(portal)/facturen/[id]/review-form";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function InterpreterInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const invoice = await getMyInterpreterInvoice(supabase, id);

  if (!invoice) {
    notFound();
  }

  const items = await listMyInterpreterInvoiceItems(supabase, id);
  const status = isInterpreterInvoiceStatus(invoice.status) ? invoice.status : "pending_review";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tolk/facturen" className="text-sm font-medium text-muted hover:text-brand-strong">
          ← Facturen
        </Link>
        <p className="eyebrow eyebrow-muted mt-2">Afrekening opdracht</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          {invoice.invoice_number ?? invoice.booking_number}
        </h1>
        <span className="chip mt-2 inline-flex">{INTERPRETER_INVOICE_STATUS_LABELS[status]}</span>
      </div>

      {status === "change_requested" && invoice.last_change_request_message ? (
        <div className="rounded-2xl border border-line bg-surface-alt/60 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Uw wijzigingsverzoek</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
            {invoice.last_change_request_message}
          </p>
        </div>
      ) : null}

      <div className="panel px-6 py-6">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Datum</dt>
            <dd className="mt-1 text-sm text-foreground">{formatDate(invoice.requested_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Inzetvorm</dt>
            <dd className="mt-1 text-sm text-foreground">
              {invoice.modality ? BOOKING_MODALITY_LABELS[invoice.modality as BookingModality] : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Talen</dt>
            <dd className="mt-1 text-sm text-foreground">
              {languageLabel(invoice.language_from)} → {languageLabel(invoice.language_to)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Werkelijke duur
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {invoice.actual_duration_minutes ? `${invoice.actual_duration_minutes} min.` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-line pt-6">
          <dl className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <dt className="text-muted">
                  {item.description}
                  {item.unit ? ` (${Number(item.quantity)} ${item.unit})` : ""}
                </dt>
                <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(item.amount_ex_vat)}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <dt className="text-muted">Subtotaal</dt>
              <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(invoice.subtotal_ex_vat)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Btw</dt>
              <dd className="tabular-nums text-foreground">{formatNumberAsCurrency(invoice.vat_amount)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2 text-base">
              <dt className="font-semibold text-brand-strong">Totaal</dt>
              <dd className="font-semibold tabular-nums text-brand-strong">
                {formatNumberAsCurrency(invoice.total_inc_vat)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {status === "pending_review" ? (
        <div className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Uw beslissing</h2>
          <p className="mt-1 text-sm text-muted">
            Controleer de afrekening. U kunt hier geen bedragen wijzigen - als er iets niet klopt,
            vraagt u een wijziging aan.
          </p>
          <div className="mt-4">
            <SettlementReviewActions invoiceId={invoice.id} />
          </div>
        </div>
      ) : null}

      {(status === "issued" || status === "paid") ? (
        <div className="panel px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">Factuur</h2>
          {status === "paid" && invoice.paid_at ? (
            <p className="mt-1 text-sm text-emerald-700">Betaald op {formatDate(invoice.paid_at.slice(0, 10))}</p>
          ) : null}
          <a
            href={`/tolk/facturen/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="button-tertiary mt-4 inline-flex px-4 py-2 text-sm"
          >
            Bekijk factuur (PDF)
          </a>
        </div>
      ) : null}
    </div>
  );
}
