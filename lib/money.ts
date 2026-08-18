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

/** Same conversion for a value already known to be non-null (e.g. a required money field's parsed result), so callers writing to a NOT NULL column don't have to fight centsToNumber's nullable signature. */
export function requiredCentsToNumber(cents: number): number {
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

export type InvoiceLineInputCents = {
  quantity: number;
  unitPriceExVatCents: number;
  vatRatePercent: number;
};

export type InvoiceLineTotalsCents = {
  subtotalExVatCents: number;
  vatAmountCents: number;
  totalIncVatCents: number;
};

/**
 * Mirrors invoice_items' generated columns exactly (see
 * supabase/migrations/20260818100200_invoices.sql): round(qty*price) for
 * the subtotal, round(subtotal*rate/100) for VAT, and the total as the SUM
 * of those two already-rounded values - never an independently rounded
 * third figure, which is what guarantees subtotal + vat = total for every
 * line with no possibility of a stray rounding cent. Used only to render a
 * live preview as the admin edits a draft; the database recomputes and
 * stores the authoritative values itself the moment the row is saved.
 */
export function calculateInvoiceLineTotalsCents({
  quantity,
  unitPriceExVatCents,
  vatRatePercent,
}: InvoiceLineInputCents): InvoiceLineTotalsCents {
  const subtotalExVatCents = Math.round(quantity * unitPriceExVatCents);
  const vatAmountCents = Math.round((subtotalExVatCents * vatRatePercent) / 100);

  return {
    subtotalExVatCents,
    vatAmountCents,
    totalIncVatCents: subtotalExVatCents + vatAmountCents,
  };
}

export type InvoiceTotalsCents = {
  subtotalExVatCents: number;
  totalVatCents: number;
  totalIncVatCents: number;
};

/** Sums already-calculated line totals into invoice-level totals - same sum-of-parts principle as recalculate_invoice_totals() in the database. */
export function sumInvoiceLineTotalsCents(
  lines: InvoiceLineTotalsCents[],
): InvoiceTotalsCents {
  const subtotalExVatCents = lines.reduce((sum, l) => sum + l.subtotalExVatCents, 0);
  const totalVatCents = lines.reduce((sum, l) => sum + l.vatAmountCents, 0);

  return {
    subtotalExVatCents,
    totalVatCents,
    totalIncVatCents: subtotalExVatCents + totalVatCents,
  };
}
