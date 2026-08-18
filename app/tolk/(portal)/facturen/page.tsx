import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listMyInterpreterInvoices } from "@/lib/interpreter-invoices/queries";
import {
  INTERPRETER_INVOICE_STATUS_LABELS,
  isInterpreterInvoiceStatus,
  type InterpreterInvoiceStatus,
} from "@/lib/interpreter-invoices/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import { getInterpreterCompleteness } from "@/lib/interpreters/completeness";
import { requireInterpreterLayoutSession } from "@/lib/auth/interpreter";
import { getInterpreterById } from "@/lib/interpreters/queries";

export const dynamic = "force-dynamic";

const statusStyles: Record<InterpreterInvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  pending_review: "bg-amber-100 text-amber-900 border-amber-300",
  change_requested: "bg-red-100 text-red-900 border-red-300",
  approved: "bg-sky-100 text-sky-900 border-sky-300",
  issued: "bg-blue-100 text-blue-900 border-blue-300",
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

export default async function InterpreterInvoicesPage() {
  const session = await requireInterpreterLayoutSession();
  const supabase = await createClient();

  if (session.status !== "authorized") {
    return null;
  }

  const [invoices, interpreter] = await Promise.all([
    listMyInterpreterInvoices(supabase),
    getInterpreterById(supabase, session.interpreter.id),
  ]);

  const completeness = interpreter
    ? getInterpreterCompleteness(interpreter, interpreter.interpreter_languages.length)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Tolkenportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Facturen</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Uw afrekeningen en self-billing facturen voor uitgevoerde opdrachten.
        </p>
      </div>

      {completeness && !completeness.paymentReady ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm leading-6 text-amber-900">
            Vul eerst uw zakelijke, fiscale en betaalgegevens aan om facturen en uitbetalingen te
            kunnen verwerken.
          </p>
          <Link
            href="/tolk/profiel"
            className="mt-2 inline-block text-sm font-semibold text-amber-900 underline decoration-amber-500/50 underline-offset-4"
          >
            Naar profiel
          </Link>
        </div>
      ) : null}

      {invoices.length === 0 ? (
        <p className="panel-soft px-4 py-6 text-sm text-muted">Nog geen afrekeningen.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const status = isInterpreterInvoiceStatus(invoice.status) ? invoice.status : "pending_review";

            return (
              <Link
                key={invoice.id}
                href={`/tolk/facturen/${invoice.id}`}
                className="content-card block px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {invoice.invoice_number ?? `Opdracht ${invoice.booking_number}`}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{formatDate(invoice.requested_date)}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? ""}`}
                  >
                    {INTERPRETER_INVOICE_STATUS_LABELS[status]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {status === "paid" ? "Betaald" : "Bedrag"}
                  </span>
                  <span className="font-semibold text-brand-strong">
                    {formatNumberAsCurrency(invoice.total_inc_vat)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
