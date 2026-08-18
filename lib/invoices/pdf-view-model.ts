import "server-only";

import type { InvoiceWithDetails } from "@/lib/invoices/queries";
import type { BusinessSettings } from "@/lib/business-settings/queries";
import { formatNumberAsCurrency } from "@/lib/money";
import { languageLabel } from "@/lib/bookings/constants";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/invoices/constants";

type SellerSnapshot = {
  company_name: string;
  address_line: string;
  postal_code: string;
  city: string;
  country: string;
  kvk_number: string;
  vat_id: string;
  iban: string;
  website: string;
  email: string | null;
  footer_text: string | null;
};

type CustomerSnapshot = {
  name: string;
  organisation: string | null;
  email: string;
  street: string | null;
  house_number: string | null;
  house_number_addition: string | null;
  postal_code: string | null;
  city: string | null;
  kvk_number: string | null;
  vat_number: string | null;
};

/**
 * Formats the Dutch structured address as the two print lines the brief
 * specifies - "Street housenumber addition" then "Postcode City", no
 * country line. Shared by both the draft (live customer row) and issued
 * (frozen snapshot) branches below, which normalise to this same shape
 * before calling it, so the two can never format an address differently.
 */
function formatBillingAddressLines(address: {
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
  const line2 = [address.postalCode?.trim(), address.city?.trim()]
    .filter(Boolean)
    .join(" ");

  return [line1, line2].filter(Boolean);
}

export type InvoicePdfViewModel = {
  status: InvoiceStatus;
  statusLabel: string;
  invoiceNumberLabel: string;
  invoiceDateLabel: string | null;
  dueDateLabel: string | null;
  seller: {
    companyName: string;
    addressLines: string[];
    kvkNumber: string;
    vatId: string;
    iban: string;
    website: string;
    email: string | null;
  };
  customer: {
    name: string;
    organisation: string | null;
    addressLines: string[];
    kvkNumber: string | null;
    vatNumber: string | null;
  };
  bookingReferenceLabel: string | null;
  items: {
    description: string;
    quantityLabel: string;
    unitPriceLabel: string;
    vatRateLabel: string;
    totalExVatLabel: string;
  }[];
  subtotalLabel: string;
  totalVatLabel: string;
  totalIncVatLabel: string;
  customerNote: string | null;
  footerText: string | null;
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

/**
 * react-pdf's standard fonts (Helvetica, used throughout - see
 * pdf-document.tsx) render via WinAnsiEncoding, which covers accented
 * Latin letters (é/ë/ï/etc. - confirmed correct) but has no glyph for ↔
 * (U+2194): it silently substitutes a stray quote mark instead of the
 * arrow. The admin HTML pages keep using ↔ for language pairs (it renders
 * fine there), so this is applied only where text is headed to the PDF.
 */
function pdfSafeText(value: string): string {
  return value.replace(/↔/g, "-");
}

/**
 * The single source of truth for what an invoice PDF/preview actually
 * shows, used by both the live draft preview and the final issued PDF (see
 * pdf-render.tsx) - the two are never allowed to compute this differently.
 *
 * A draft has no seller/customer_snapshot yet (those are only written by
 * issue_invoice()), so its view is built from the *current*
 * business_settings and customer rows - correctly dynamic, since nothing
 * about a draft is final. An issued+ invoice ignores both of those inputs
 * entirely and renders exclusively from its own frozen snapshot, so a
 * later edit to business_settings or the customer record can never change
 * how a historical invoice looks.
 */
export function buildInvoicePdfViewModel(
  invoice: InvoiceWithDetails,
  currentBusinessSettings: BusinessSettings,
): InvoicePdfViewModel {
  const status = invoice.status as InvoiceStatus;
  const isDraft = status === "draft";

  const seller: SellerSnapshot = isDraft
    ? {
        company_name: currentBusinessSettings.company_name,
        address_line: currentBusinessSettings.address_line,
        postal_code: currentBusinessSettings.postal_code,
        city: currentBusinessSettings.city,
        country: currentBusinessSettings.country,
        kvk_number: currentBusinessSettings.kvk_number,
        vat_id: currentBusinessSettings.vat_id,
        iban: currentBusinessSettings.iban,
        website: currentBusinessSettings.website,
        email: currentBusinessSettings.email,
        footer_text: currentBusinessSettings.footer_text,
      }
    : (invoice.seller_snapshot as unknown as SellerSnapshot);

  const customer: CustomerSnapshot = isDraft
    ? {
        name: invoice.customer.billing_name?.trim() || invoice.customer.name,
        organisation: invoice.customer.organisation,
        email: invoice.customer.billing_email?.trim() || invoice.customer.email,
        street: invoice.customer.billing_street,
        house_number: invoice.customer.billing_house_number,
        house_number_addition: invoice.customer.billing_house_number_addition,
        postal_code: invoice.customer.billing_postal_code,
        city: invoice.customer.billing_city,
        kvk_number: invoice.customer.kvk_number,
        vat_number: invoice.customer.vat_number,
      }
    : (invoice.customer_snapshot as unknown as CustomerSnapshot);

  const bookingReferenceLabel = invoice.booking
    ? [
        `Boeking ${invoice.booking.booking_number}`,
        formatDateLabel(invoice.booking.requested_date),
        invoice.booking.language_from && invoice.booking.language_to
          ? pdfSafeText(
              `${languageLabel(invoice.booking.language_from)} ↔ ${languageLabel(invoice.booking.language_to)}`,
            )
          : null,
      ]
        .filter((part): part is string => Boolean(part))
        .join(" · ")
    : null;

  return {
    status,
    statusLabel: INVOICE_STATUS_LABELS[status],
    invoiceNumberLabel: invoice.invoice_number ?? "CONCEPT",
    invoiceDateLabel: formatDateLabel(invoice.invoice_date),
    dueDateLabel: formatDateLabel(invoice.due_date),
    seller: {
      companyName: seller.company_name,
      addressLines: [
        seller.address_line,
        `${seller.postal_code} ${seller.city}`,
        seller.country,
      ],
      kvkNumber: seller.kvk_number,
      vatId: seller.vat_id,
      iban: seller.iban,
      website: seller.website,
      email: seller.email,
    },
    customer: {
      name: customer.name,
      organisation: customer.organisation,
      addressLines: formatBillingAddressLines({
        street: customer.street,
        houseNumber: customer.house_number,
        houseNumberAddition: customer.house_number_addition,
        postalCode: customer.postal_code,
        city: customer.city,
      }),
      kvkNumber: customer.kvk_number,
      vatNumber: customer.vat_number,
    },
    bookingReferenceLabel,
    items: invoice.items.map((item) => ({
      description: pdfSafeText(item.description),
      quantityLabel: Number(item.quantity) === 1 ? "1" : String(Number(item.quantity)),
      unitPriceLabel: formatNumberAsCurrency(item.unit_price_ex_vat),
      vatRateLabel: `${Number(item.vat_rate)}%`,
      totalExVatLabel: formatNumberAsCurrency(item.line_subtotal_ex_vat),
    })),
    subtotalLabel: formatNumberAsCurrency(invoice.subtotal_ex_vat),
    totalVatLabel: formatNumberAsCurrency(invoice.total_vat),
    totalIncVatLabel: formatNumberAsCurrency(invoice.total_inc_vat),
    customerNote: invoice.customer_note,
    footerText: seller.footer_text,
  };
}
