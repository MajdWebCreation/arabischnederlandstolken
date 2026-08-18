import "server-only";

import type { InterpreterInvoiceWithDetails } from "@/lib/interpreter-invoices/queries";
import { formatNumberAsCurrency } from "@/lib/money";
import { languageLabel } from "@/lib/bookings/constants";
import { INTERPRETER_INVOICE_STATUS_LABELS } from "@/lib/interpreter-invoices/constants";
import type { InterpreterInvoiceStatus } from "@/lib/interpreter-invoices/constants";

type BookingSnapshot = {
  booking_number: string;
  requested_date: string | null;
  modality: string | null;
  language_from: string;
  language_to: string;
  actual_duration_minutes: number | null;
  expected_duration_minutes: number | null;
};

function formatAddressLines(address: {
  street: string | null;
  houseNumber: string | null;
  houseNumberAddition: string | null;
  postalCode: string | null;
  city: string | null;
}): string[] {
  const line1 = [address.street, address.houseNumber, address.houseNumberAddition]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const line2 = [address.postalCode?.trim(), address.city?.trim()].filter(Boolean).join(" ");

  return [line1, line2].filter(Boolean);
}

export type InterpreterInvoicePdfViewModel = {
  status: InterpreterInvoiceStatus;
  statusLabel: string;
  invoiceNumberLabel: string;
  issuedDateLabel: string | null;
  supplier: {
    name: string;
    tradeName: string | null;
    addressLines: string[];
    kvkNumber: string | null;
    vatId: string | null;
    iban: string;
    accountHolderName: string;
  };
  buyer: {
    name: string;
    address: string;
    kvk: string;
    vatId: string;
  };
  serviceReferenceLabel: string | null;
  serviceDateLabel: string | null;
  items: {
    description: string;
    quantityLabel: string;
    unitLabel: string | null;
    unitPriceLabel: string;
    amountLabel: string;
  }[];
  subtotalLabel: string;
  vatTreatment: "standard_vat" | "kor" | "no_vat" | "other";
  vatLabel: string;
  vatAmountLabel: string;
  totalLabel: string;
  fiscalNote: string | null;
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function pdfSafeText(value: string): string {
  return value.replace(/↔/g, "-");
}

const MODALITY_LABELS: Record<string, string> = {
  telephone: "Telefonisch",
  video: "Video",
  onsite: "Ter plaatse",
};

/**
 * The single source of truth for what an issued self-billing PDF actually
 * shows - only called for status='issued'/'paid' invoices, which always
 * have their supplier/buyer/booking_snapshot columns filled in by
 * issue_interpreter_invoice(). Never reads the interpreter's *current*
 * profile or the booking's *current* fields - only the frozen snapshot, so
 * a later profile/booking edit can never change a historical document (see
 * enforce_interpreter_invoice_immutability()).
 */
export function buildInterpreterInvoicePdfViewModel(
  invoice: InterpreterInvoiceWithDetails,
): InterpreterInvoicePdfViewModel {
  const status = invoice.status as InterpreterInvoiceStatus;
  const booking = invoice.booking_snapshot as unknown as BookingSnapshot | null;

  const vatTreatment = (invoice.vat_treatment_snapshot ?? "other") as
    | "standard_vat"
    | "kor"
    | "no_vat"
    | "other";

  let vatLabel: string;
  if (vatTreatment === "standard_vat") {
    vatLabel = `Btw ${invoice.vat_rate !== null ? Number(invoice.vat_rate) : 0}%`;
  } else if (vatTreatment === "kor") {
    // Never presented as ordinary "0% btw" - see brief section 8.
    vatLabel = "Btw (kleineondernemersregeling)";
  } else {
    vatLabel = "Btw";
  }

  return {
    status,
    statusLabel: INTERPRETER_INVOICE_STATUS_LABELS[status],
    invoiceNumberLabel: invoice.invoice_number ?? "CONCEPT",
    issuedDateLabel: invoice.issued_at ? formatDateLabel(invoice.issued_at.slice(0, 10)) : null,
    supplier: {
      name: invoice.supplier_legal_name ?? "-",
      tradeName: invoice.supplier_trade_name,
      addressLines: formatAddressLines({
        street: invoice.supplier_street,
        houseNumber: invoice.supplier_house_number,
        houseNumberAddition: invoice.supplier_house_number_addition,
        postalCode: invoice.supplier_postal_code,
        city: invoice.supplier_city,
      }),
      kvkNumber: invoice.supplier_kvk_number,
      vatId: invoice.supplier_vat_id,
      iban: invoice.supplier_iban ?? "-",
      accountHolderName: invoice.supplier_account_holder_name ?? "-",
    },
    buyer: {
      name: invoice.buyer_name ?? "-",
      address: invoice.buyer_address ?? "-",
      kvk: invoice.buyer_kvk ?? "-",
      vatId: invoice.buyer_vat_id ?? "-",
    },
    serviceReferenceLabel: booking
      ? pdfSafeText(
          [
            `Boeking ${booking.booking_number}`,
            booking.language_from && booking.language_to
              ? `${languageLabel(booking.language_from)} - ${languageLabel(booking.language_to)}`
              : null,
            booking.modality ? MODALITY_LABELS[booking.modality] : null,
          ]
            .filter((part): part is string => Boolean(part))
            .join(" · "),
        )
      : null,
    serviceDateLabel: booking?.requested_date ? formatDateLabel(booking.requested_date) : null,
    items: invoice.items.map((item) => ({
      description: pdfSafeText(item.description),
      quantityLabel: Number(item.quantity) === 1 ? "1" : String(Number(item.quantity)),
      unitLabel: item.unit,
      unitPriceLabel: formatNumberAsCurrency(item.unit_price_ex_vat),
      amountLabel: formatNumberAsCurrency(item.amount_ex_vat),
    })),
    subtotalLabel: formatNumberAsCurrency(invoice.subtotal_ex_vat),
    vatTreatment,
    vatLabel,
    vatAmountLabel: formatNumberAsCurrency(invoice.vat_amount),
    totalLabel: formatNumberAsCurrency(invoice.total_inc_vat),
    fiscalNote: invoice.fiscal_note,
  };
}
