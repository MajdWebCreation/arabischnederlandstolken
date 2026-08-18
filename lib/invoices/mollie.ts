import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InvoiceWithDetails } from "@/lib/invoices/queries";
import { numberToCents } from "@/lib/money";
import { createMolliePaymentLink, MollieApiError } from "@/lib/mollie/client";

type TypedClient = SupabaseClient<Database>;

export type PaymentLinkResult =
  | { status: "not_needed" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

const MOLLIE_ERROR_MESSAGES: Record<string, string> = {
  mollie_not_configured:
    "Mollie is niet geconfigureerd (MOLLIE_API_KEY ontbreekt op de server). Stel deze omgevingsvariabele in om facturen met een betaallink te kunnen versturen.",
};

function friendlyMollieError(message: string): string {
  return (
    MOLLIE_ERROR_MESSAGES[message] ??
    "Het aanmaken van de Mollie-betaallink is niet gelukt. Probeer het later opnieuw."
  );
}

/**
 * Decides whether an already-issued invoice needs a Mollie payment link at
 * all, and if so, reuses the stored one when it still matches the
 * invoice's own immutable total_inc_vat, or creates exactly one new
 * `reusable: false` link otherwise (never per resend - see sendInvoiceAction,
 * the only caller). Never called for a draft or cancelled invoice; those
 * are already refused before this runs.
 *
 * "not_needed" (not an error) covers every case section 4 of the brief
 * says must never get a payment link: already paid, or a zero/negative
 * total (which Mollie's own API would reject anyway, and which makes no
 * business sense to ask someone to pay).
 */
export async function getOrCreateInvoicePaymentLink(
  supabase: TypedClient,
  invoice: InvoiceWithDetails,
  companyName: string,
): Promise<PaymentLinkResult> {
  const totalCents = numberToCents(invoice.total_inc_vat);

  if (invoice.status === "paid" || totalCents === null || totalCents <= 0) {
    return { status: "not_needed" };
  }

  if (invoice.mollie_payment_url && invoice.mollie_payment_link_amount_cents === totalCents) {
    return { status: "ready", url: invoice.mollie_payment_url };
  }

  const invoiceNumber = invoice.invoice_number ?? invoice.id;

  try {
    const link = await createMolliePaymentLink({
      amountValue: (totalCents / 100).toFixed(2),
      description: `Factuur ${invoiceNumber} – ${companyName}`,
    });

    const { error } = await supabase
      .from("invoices")
      .update({
        mollie_payment_link_id: link.id,
        mollie_payment_url: link.url,
        mollie_payment_link_amount_cents: totalCents,
        mollie_payment_link_created_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    if (error) {
      return {
        status: "error",
        message: "De betaallink is aangemaakt maar kon niet worden opgeslagen. Probeer het opnieuw.",
      };
    }

    return { status: "ready", url: link.url };
  } catch (err) {
    const message = err instanceof MollieApiError ? err.message : "mollie_request_failed";
    return { status: "error", message: friendlyMollieError(message) };
  }
}
