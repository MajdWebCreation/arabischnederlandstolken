/**
 * Money handling for the admin dashboard.
 *
 * The database stores every monetary field as NUMERIC(10,2) - never a
 * float. On the application side, the risk isn't the wire format (a value
 * with at most 2 decimal places round-trips exactly through a JS number at
 * these magnitudes) - it's arithmetic: adding/subtracting plain JS numbers
 * accumulates binary floating point error (0.1 + 0.2 !== 0.3). So every
 * calculation here happens in integer cents, and only the parse/format
 * boundaries touch decimal strings or numbers.
 */

const MONEY_INPUT_PATTERN = /^\d{1,8}([.,]\d{1,2})?$/;

/**
 * Parses a form text input ("110", "110,5", "110.50") into integer cents.
 * Returns `null` for an empty/blank input (meaning "not set"), and
 * `undefined` for anything that isn't a valid non-negative amount with at
 * most 2 decimals - callers should treat `undefined` as a validation error.
 */
export function parseMoneyInputToCents(raw: string): number | null | undefined {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return null;
  }

  if (!MONEY_INPUT_PATTERN.test(trimmed)) {
    return undefined;
  }

  const [wholePart, fractionPart = ""] = trimmed.replace(",", ".").split(".");
  const fractionDigits = `${fractionPart}00`.slice(0, 2);

  return Number(wholePart) * 100 + Number(fractionDigits);
}

/** Converts a NUMERIC value read back from Supabase (or null) into integer cents. */
export function numberToCents(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * 100);
}

/** Converts integer cents into the plain number Supabase expects for a NUMERIC(10,2) column. */
export function centsToNumber(cents: number | null): number | null {
  if (cents === null) {
    return null;
  }

  return Math.round(cents) / 100;
}

const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function formatCentsAsCurrency(cents: number | null): string {
  if (cents === null) {
    return "—";
  }

  return currencyFormatter.format(cents / 100);
}

export function formatNumberAsCurrency(value: number | null): string {
  return formatCentsAsCurrency(numberToCents(value));
}

/**
 * Formats cents as a bare decimal string for pre-filling an editable form
 * input (no currency symbol, dot decimal separator).
 */
export function centsToInputValue(cents: number | null): string {
  if (cents === null) {
    return "";
  }

  return (cents / 100).toFixed(2);
}

export type MarginInputCents = {
  customerPriceCents: number | null;
  customerTravelFeeCents: number | null;
  interpreterCostCents: number | null;
  interpreterTravelCostCents: number | null;
};

/**
 * Estimated gross margin = (customer price + customer travel fee) minus
 * (interpreter cost + interpreter travel cost), all excl. VAT. Returns null
 * when the customer price or interpreter cost isn't known yet - a booking
 * that hasn't been quoted or assigned has no meaningful margin, and
 * treating "unknown" as "zero" would be misleading. Overtime rates are
 * deliberately excluded: Phase 1 has no field for actual overtime hours
 * used, so multiplying a rate by an untracked quantity would be fiction.
 */
export function calculateMarginCents({
  customerPriceCents,
  customerTravelFeeCents,
  interpreterCostCents,
  interpreterTravelCostCents,
}: MarginInputCents): number | null {
  if (customerPriceCents === null || interpreterCostCents === null) {
    return null;
  }

  const revenue = customerPriceCents + (customerTravelFeeCents ?? 0);
  const cost = interpreterCostCents + (interpreterTravelCostCents ?? 0);

  return revenue - cost;
}
