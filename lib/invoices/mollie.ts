import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InvoiceWithDetails } from "@/lib/invoices/queries";
import { numberToCents } from "@/lib/money";
import {
  createMolliePaymentLink,
  getMollieMode,
  MollieApiError,
  type MollieErrorDetails,
} from "@/lib/mollie/client";

type TypedClient = SupabaseClient<Database>;

export type PaymentLinkResult =
  | { status: "not_needed" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

const MOLLIE_ERROR_MESSAGES: Record<string, string> = {
  mollie_not_configured:
    "Mollie is niet geconfigureerd (MOLLIE_API_KEY ontbreekt op de server). Stel deze omgevingsvariabele in om facturen met een betaallink te kunnen versturen.",
};

/**
 * Admin-only messaging (this whole invoices section already requires
 * requireAdminAction() - a customer/interpreter never sees any of this).
 * HTTP 422 from POST /v2/payment-links is Mollie's own documented response
 * for "no suitable [live] payment method is currently active for this
 * profile/currency/amount" - an external Mollie Dashboard configuration
 * matter, not something a retry or a code change here can fix, so this
 * says so plainly instead of the previous generic "probeer het opnieuw."
 * The raw title/detail/field never appear in this message - see the
 * console.error in getOrCreateInvoicePaymentLink's catch block below for
 * where those go instead.
 */
function friendlyMollieError(message: string, details?: MollieErrorDetails): string {
  if (message === "mollie_not_configured") {
    return MOLLIE_ERROR_MESSAGES.mollie_not_configured;
  }

  if (details?.httpStatus === 422) {
    return "Mollie kon geen geschikte live betaalmethode vinden voor dit profiel, bedrag of valuta. Controleer de geactiveerde betaalmethoden in Mollie. (HTTP 422)";
  }

  if (details?.httpStatus) {
    return `Het aanmaken van de Mollie-betaallink is niet gelukt (HTTP ${details.httpStatus}). Probeer het later opnieuw.`;
  }

  return "Het aanmaken van de Mollie-betaallink is niet gelukt. Probeer het later opnieuw.";
}

/**
 * Decides whether an already-issued invoice needs a Mollie payment link at
 * all, and if so, reuses the stored one when it still matches both the
 * invoice's own immutable total_inc_vat AND the server's current Mollie
 * mode (test/live), or creates exactly one new `reusable: false` link
 * otherwise (never per resend - see sendInvoiceAction, the only caller).
 * Never called for a draft or cancelled invoice; those are already refused
 * before this runs.
 *
 * The mode check exists because a Mollie payment link is permanently bound
 * to whichever API key mode created it - a link minted under a test_...
 * key only ever opens Mollie's test checkout, forever, even after
 * MOLLIE_API_KEY is switched to live_.... Without this check, an invoice
 * that got a payment link while the app was still running in test mode
 * would keep silently reusing that dead test link after going live. A
 * mode mismatch is treated exactly like "no link exists yet": a fresh one
 * is created and the cached fields (id, url, amount, mode) are fully
 * replaced, never merged with the stale ones.
 *
 * "not_needed" (not an error) covers every case section 4 of the original
 * brief says must never get a payment link: already paid, or a
 * zero/negative total (which Mollie's own API would reject anyway, and
 * which makes no business sense to ask someone to pay).
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

  const currentMode = getMollieMode();

  if (!currentMode) {
    return { status: "error", message: friendlyMollieError("mollie_not_configured") };
  }

  if (
    invoice.mollie_payment_url &&
    invoice.mollie_payment_link_amount_cents === totalCents &&
    invoice.mollie_payment_link_mode === currentMode
  ) {
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
        mollie_payment_link_mode: link.mode,
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
    const details = err instanceof MollieApiError ? err.details : undefined;

    // Sanitized diagnostics only (status/title/detail/field) - never the
    // API key or Authorization header, which never reach this catch block
    // in the first place (lib/mollie/client.ts only ever throws the
    // response's own error body, not the request). Server-side only
    // (visible in Vercel function logs); the admin UI gets the friendly
    // message from friendlyMollieError() below, not this raw data.
    console.error("[mollie] payment-link creation failed", {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      message,
      ...details,
    });

    return { status: "error", message: friendlyMollieError(message, details) };
  }
}
