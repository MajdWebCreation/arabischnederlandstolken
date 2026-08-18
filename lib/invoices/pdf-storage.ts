import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InvoiceWithDetails } from "@/lib/invoices/queries";
import type { BusinessSettings } from "@/lib/business-settings/queries";
import { renderInvoicePdfBuffer } from "@/lib/invoices/pdf-render";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

const INVOICE_BUCKET = "invoices";

function storagePathFor(invoiceNumber: string) {
  return `${invoiceNumber}.pdf`;
}

async function uploadInvoicePdf(
  supabase: TypedClient,
  invoiceId: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const path = storagePathFor(invoiceNumber);

  const { error: uploadError } = await supabase.storage
    .from(INVOICE_BUCKET)
    .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ pdf_storage_path: path })
    .eq("id", invoiceId);

  if (updateError) {
    throw updateError;
  }

  return path;
}

/**
 * Downloads the exact stored bytes at `path` in the private invoices
 * bucket, or null if missing or unreadable by the caller's own
 * RLS-scoped client. Never regenerates or falls back to anything - it is
 * purely "what, if anything, is actually sitting in Storage right now".
 * Shared by getIssuedInvoicePdfBuffer's own regeneration-fallback logic
 * below and by the customer-portal PDF route
 * (app/klant/(portal)/facturen/[id]/pdf/route.ts), which must never
 * trigger that fallback - see that route's own comment for why.
 */
export async function downloadStoredInvoicePdf(
  supabase: TypedClient,
  path: string,
): Promise<Buffer | null> {
  const { data, error } = await supabase.storage.from(INVOICE_BUCKET).download(path);

  if (error || !data) {
    return null;
  }

  return Buffer.from(await data.arrayBuffer());
}

/**
 * The single place an issued invoice's PDF bytes are obtained from for the
 * admin environment - called right after issue_invoice() succeeds, by the
 * preview/download route, and by the send-email action, so all three
 * always agree on the exact same document.
 *
 * Storage upload is a separate HTTP call from the issue_invoice() database
 * transaction and can't be made perfectly atomic with it. If
 * pdf_storage_path is set, its stored bytes are downloaded and returned
 * unchanged. If it's missing, or the download fails, this regenerates from
 * the invoice's own frozen seller/customer_snapshot (never live
 * business_settings/customer data - buildInvoicePdfViewModel already
 * guarantees that for any non-draft invoice) and persists it, so a
 * transient Storage failure at issue time can't permanently strand an
 * issued invoice without its document. The customer-facing PDF route
 * deliberately does not use this function - it must never regenerate a
 * historical document, only ever serve what is already stored.
 */
export async function getIssuedInvoicePdfBuffer(
  supabase: TypedClient,
  invoice: InvoiceWithDetails,
  currentBusinessSettings: BusinessSettings,
): Promise<Buffer> {
  if (invoice.status === "draft") {
    throw new Error("getIssuedInvoicePdfBuffer called for a draft invoice.");
  }

  if (invoice.pdf_storage_path) {
    const stored = await downloadStoredInvoicePdf(supabase, invoice.pdf_storage_path);

    if (stored) {
      return stored;
    }
  }

  const invoiceNumber = assertNonNull(invoice.invoice_number, "invoices.invoice_number");
  const pdfBuffer = await renderInvoicePdfBuffer(invoice, currentBusinessSettings);
  await uploadInvoicePdf(supabase, invoice.id, invoiceNumber, pdfBuffer);

  return pdfBuffer;
}
