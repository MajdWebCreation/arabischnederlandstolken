import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/lib/invoices/pdf-document";
import { buildInvoicePdfViewModel } from "@/lib/invoices/pdf-view-model";
import type { InvoiceWithDetails } from "@/lib/invoices/queries";
import type { BusinessSettings } from "@/lib/business-settings/queries";

let cachedLogo: Buffer | undefined;

async function getLogoBuffer(): Promise<Buffer> {
  if (!cachedLogo) {
    // The real site logo (see public/brand/logo-full.webp), converted to
    // PNG once at authoring time because react-pdf's <Image> only accepts
    // PNG/JPEG, not WebP. Read from disk rather than fetched over HTTP so
    // PDF generation never depends on the app's own base URL being
    // reachable from wherever this runs.
    cachedLogo = await readFile(
      path.join(process.cwd(), "public/brand/logo-invoice.png"),
    );
  }

  return cachedLogo;
}

/**
 * Renders an invoice to PDF bytes. Draft invoices render live from current
 * business_settings/customer data; issued+ invoices render from their own
 * frozen snapshot - see buildInvoicePdfViewModel for the actual rule. This
 * is the one and only PDF-rendering path in the app: the admin preview
 * route and the issue-time Storage upload both call this same function, so
 * they can never drift into two different-looking documents.
 */
export async function renderInvoicePdfBuffer(
  invoice: InvoiceWithDetails,
  currentBusinessSettings: BusinessSettings,
): Promise<Buffer> {
  const viewModel = buildInvoicePdfViewModel(invoice, currentBusinessSettings);
  const logo = await getLogoBuffer();

  // Called directly as a function rather than via createElement/JSX:
  // react-pdf's renderToBuffer is typed to accept only a literal
  // ReactElement<DocumentProps> (i.e. a <Document> element itself), not an
  // element of a component that merely renders one. InvoicePdfDocument has
  // no hooks, so invoking it as a plain function is exactly equivalent at
  // runtime to rendering it as JSX, and returns the <Document> element
  // renderToBuffer's types actually expect.
  const buffer = await renderToBuffer(
    InvoicePdfDocument({
      viewModel,
      logoSrc: { data: logo, format: "png" },
    }),
  );

  return buffer;
}
