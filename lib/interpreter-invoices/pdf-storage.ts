import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InterpreterInvoiceWithDetails } from "@/lib/interpreter-invoices/queries";
import { renderInterpreterInvoicePdfBuffer } from "@/lib/interpreter-invoices/pdf-render";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

const BUCKET = "interpreter-invoices";

function storagePathFor(invoiceNumber: string) {
  return `${invoiceNumber}.pdf`;
}

async function uploadInterpreterInvoicePdf(
  supabase: TypedClient,
  invoiceId: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const path = storagePathFor(invoiceNumber);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await supabase
    .from("interpreter_invoices")
    .update({ pdf_storage_path: path })
    .eq("id", invoiceId);

  if (updateError) {
    throw updateError;
  }

  return path;
}

/** Downloads the exact stored bytes at `path`, or null if missing/unreadable by the caller's RLS-scoped client. Never regenerates. Mirrors downloadStoredInvoicePdf(). */
export async function downloadStoredInterpreterInvoicePdf(
  supabase: TypedClient,
  path: string,
): Promise<Buffer | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);

  if (error || !data) {
    return null;
  }

  return Buffer.from(await data.arrayBuffer());
}

/**
 * The single place an issued self-billing invoice's PDF bytes are obtained
 * from, for the admin environment - called right after
 * issue_interpreter_invoice() succeeds, and by the admin PDF/download
 * route. Mirrors getIssuedInvoicePdfBuffer() exactly: if pdf_storage_path is
 * set, its stored bytes are served unchanged; if missing or unreadable, this
 * regenerates from the invoice's own frozen snapshot (never live
 * interpreter/business_settings/booking data) and persists it, so a
 * transient Storage failure at issue time can't permanently strand an
 * issued invoice without its document. The interpreter-facing PDF route
 * deliberately does not use this function - see its own comment.
 */
export async function getIssuedInterpreterInvoicePdfBuffer(
  supabase: TypedClient,
  invoice: InterpreterInvoiceWithDetails,
): Promise<Buffer> {
  if (invoice.status === "draft" || invoice.status === "pending_review" || invoice.status === "change_requested" || invoice.status === "approved") {
    throw new Error("getIssuedInterpreterInvoicePdfBuffer called for a not-yet-issued settlement.");
  }

  if (invoice.pdf_storage_path) {
    const stored = await downloadStoredInterpreterInvoicePdf(supabase, invoice.pdf_storage_path);

    if (stored) {
      return stored;
    }
  }

  const invoiceNumber = assertNonNull(invoice.invoice_number, "interpreter_invoices.invoice_number");
  const pdfBuffer = await renderInterpreterInvoicePdfBuffer(invoice);
  await uploadInterpreterInvoicePdf(supabase, invoice.id, invoiceNumber, pdfBuffer);

  return pdfBuffer;
}
