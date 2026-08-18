import "server-only";

/**
 * A hand-rolled client for exactly one Mollie endpoint (POST
 * /v2/payment-links) rather than the @mollie/api-client SDK - this
 * integration needs nothing else from Mollie (no Invoicing, no Sales
 * Invoices, no subscriptions, no Mollie customers), so a full SDK
 * dependency would add surface area for a single fetch call. MOLLIE_API_KEY
 * is read here and only here; it never reaches a NEXT_PUBLIC_ variable, the
 * database, a log line, or any response sent to a browser - see
 * createOrReuseInvoicePaymentLink() in lib/invoices/mollie.ts for the one
 * caller, which is itself only ever invoked from an admin Server Action.
 */

// Overridable only for pointing at a local mock in this project's own test
// scripts (see scripts/) - never set in any real environment, so
// production/dev always talk to the real Mollie API.
const MOLLIE_API_BASE = process.env.MOLLIE_API_BASE_URL || "https://api.mollie.com/v2";

function isSafeConfigurationValue(value: string | undefined) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

/** Null when MOLLIE_API_KEY isn't set (or is set to something unsafe/empty) - callers decide what that means for their own flow. */
export function getMollieApiKey(): string | null {
  const key = process.env.MOLLIE_API_KEY;
  return isSafeConfigurationValue(key) ? key!.trim() : null;
}

export class MollieApiError extends Error {}

export type CreatePaymentLinkInput = {
  /** Decimal string with exactly two decimals, e.g. "360.58" - Mollie's own required format, never a float. */
  amountValue: string;
  description: string;
};

export type MolliePaymentLink = {
  id: string;
  url: string;
};

/**
 * Creates a single, non-reusable Mollie payment link. `reusable: false` is
 * hardcoded, never a parameter - this link belongs to exactly one invoice
 * and must not silently become a way to collect payment for anything else.
 * Throws MollieApiError on any failure; never returns a partial/guessed
 * result.
 */
export async function createMolliePaymentLink(
  input: CreatePaymentLinkInput,
): Promise<MolliePaymentLink> {
  const apiKey = getMollieApiKey();

  if (!apiKey) {
    throw new MollieApiError("mollie_not_configured");
  }

  let response: Response;

  try {
    response = await fetch(`${MOLLIE_API_BASE}/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { currency: "EUR", value: input.amountValue },
        description: input.description,
        reusable: false,
      }),
    });
  } catch {
    throw new MollieApiError("mollie_request_failed");
  }

  if (!response.ok) {
    throw new MollieApiError(`mollie_request_failed_${response.status}`);
  }

  const data: unknown = await response.json().catch(() => null);
  const id = (data as { id?: unknown } | null)?.id;
  const paymentLinkHref = (
    data as { _links?: { paymentLink?: { href?: unknown } } } | null
  )?._links?.paymentLink?.href;

  if (typeof id !== "string" || typeof paymentLinkHref !== "string") {
    throw new MollieApiError("mollie_invalid_response");
  }

  return { id, url: paymentLinkHref };
}
