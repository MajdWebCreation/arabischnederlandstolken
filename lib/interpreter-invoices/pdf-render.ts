import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { InterpreterInvoicePdfDocument } from "@/lib/interpreter-invoices/pdf-document";
import { buildInterpreterInvoicePdfViewModel } from "@/lib/interpreter-invoices/pdf-view-model";
import type { InterpreterInvoiceWithDetails } from "@/lib/interpreter-invoices/queries";

let cachedLogo: Buffer | undefined;

async function getLogoBuffer(): Promise<Buffer> {
  if (!cachedLogo) {
    cachedLogo = await readFile(path.join(process.cwd(), "public/brand/logo-invoice.png"));
  }

  return cachedLogo;
}

/**
 * Renders an issued self-billing invoice to PDF bytes. Unlike the customer
 * invoice system, there is no "live draft preview" mode here - a settlement
 * before issue has no PDF at all (it's reviewed on-screen in /tolk/facturen
 * instead), so this is only ever called for status='issued'/'paid'
 * invoices, which always carry the frozen snapshot buildInterpreterInvoicePdfViewModel
 * requires.
 */
export async function renderInterpreterInvoicePdfBuffer(
  invoice: InterpreterInvoiceWithDetails,
): Promise<Buffer> {
  const viewModel = buildInterpreterInvoicePdfViewModel(invoice);
  const logo = await getLogoBuffer();

  const buffer = await renderToBuffer(
    InterpreterInvoicePdfDocument({
      viewModel,
      logoSrc: { data: logo, format: "png" },
    }),
  );

  return buffer;
}
