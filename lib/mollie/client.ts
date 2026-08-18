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

export type MollieMode = "test" | "live";

/**
 * Mollie API keys are always prefixed test_ or live_ - this is the sole,
 * authoritative source of "which mode are we actually running in" used
 * throughout the invoice payment-link flow (see
 * getOrCreateInvoicePaymentLink in lib/invoices/mollie.ts). Returns null
 * when no key is configured, or when a configured key doesn't match either
 * known prefix - callers must treat that exactly like "not configured"
 * (refuse, never guess) rather than assuming a mode.
 */
export function getMollieMode(): MollieMode | null {
  const apiKey = getMollieApiKey();

  if (!apiKey) {
    return null;
  }

  if (apiKey.startsWith("live_")) return "live";
  if (apiKey.startsWith("test_")) return "test";

  return null;
}

/**
 * The sanitized subset of Mollie's own error response body - status/title/
 * detail/field only, exactly the fields the Mollie API problem-details
 * format defines. Never anything from the request itself (no headers, no
 * API key), so this is always safe to log server-side or show an admin,
 * even though nothing here is currently rendered directly to a customer or
 * interpreter.
 */
export type MollieErrorDetails = {
  httpStatus: number;
  title?: string;
  detail?: string;
  field?: string;
};

export class MollieApiError extends Error {
  readonly details?: MollieErrorDetails;

  constructor(message: string, details?: MollieErrorDetails) {
    super(message);
    this.name = "MollieApiError";
    this.details = details;
  }
}

function extractMollieErrorDetails(httpStatus: number, body: unknown): MollieErrorDetails {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  return {
    httpStatus,
    title: typeof record.title === "string" ? record.title : undefined,
    detail: typeof record.detail === "string" ? record.detail : undefined,
    field: typeof record.field === "string" ? record.field : undefined,
  };
}

export type CreatePaymentLinkInput = {
  /** Decimal string with exactly two decimals, e.g. "360.58" - Mollie's own required format, never a float. */
  amountValue: string;
  description: string;
};

export type MolliePaymentLink = {
  id: string;
  url: string;
  /** The mode actually used for this specific call, derived from the same key at the moment of the request - never assumed separately by the caller, so a persisted record can never silently drift from what was really used to create it. */
  mode: MollieMode;
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
  const mode = getMollieMode();

  if (!apiKey || !mode) {
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
    // Mollie's error responses are themselves a small, sanitized JSON
    // problem-details body (status/title/detail/field) - reading it here is
    // what lets the caller log/report something more useful than a bare
    // HTTP status, without ever touching anything from the request itself.
    const errorBody: unknown = await response.json().catch(() => null);
    throw new MollieApiError(
      `mollie_request_failed_${response.status}`,
      extractMollieErrorDetails(response.status, errorBody),
    );
  }

  const data: unknown = await response.json().catch(() => null);
  const id = (data as { id?: unknown } | null)?.id;
  const paymentLinkHref = (
    data as { _links?: { paymentLink?: { href?: unknown } } } | null
  )?._links?.paymentLink?.href;

  if (typeof id !== "string" || typeof paymentLinkHref !== "string") {
    throw new MollieApiError("mollie_invalid_response");
  }

  return { id, url: paymentLinkHref, mode };
}
