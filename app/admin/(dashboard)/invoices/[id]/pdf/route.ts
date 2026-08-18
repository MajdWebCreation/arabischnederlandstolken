import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAuthState } from "@/lib/auth/admin";
import { getInvoiceById } from "@/lib/invoices/queries";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import { renderInvoicePdfBuffer } from "@/lib/invoices/pdf-render";
import { getIssuedInvoicePdfBuffer } from "@/lib/invoices/pdf-storage";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The single place a PDF's bytes are ever produced or handed out - the
 * admin preview iframe and every "download PDF" link point here. A draft
 * renders live from current data every request; an issued+ invoice is
 * served from its stored artifact in the private `invoices` Storage
 * bucket, never regenerated, so a historical document never silently
 * changes underneath someone re-opening it.
 *
 * This route sits under /admin, which the proxy matcher covers, but that
 * is only a session-refresh convenience - like every Server Action in this
 * app, it re-checks admin authorization itself rather than trusting
 * anything about how the request arrived.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authState = await getAdminAuthState();

  if (authState.status !== "authorized") {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 403 });
  }

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Ongeldige factuur." }, { status: 404 });
  }

  const supabase = await createClient();
  const invoice = await getInvoiceById(supabase, id);

  if (!invoice) {
    return NextResponse.json({ error: "Factuur niet gevonden." }, { status: 404 });
  }

  const businessSettings = await getBusinessSettings(supabase);
  const pdfBytes =
    invoice.status === "draft"
      ? await renderInvoicePdfBuffer(invoice, businessSettings)
      : await getIssuedInvoicePdfBuffer(supabase, invoice, businessSettings);

  const filename = `${invoice.invoice_number ?? "conceptfactuur"}.pdf`;

  // NextResponse's BodyInit type doesn't accept Node's Buffer<ArrayBufferLike>
  // directly (a TS lib-definition mismatch, not a runtime one - Buffer's
  // backing store is typed broadly enough to include SharedArrayBuffer,
  // which the stricter BlobPart/BodyInit types now reject). Re-wrapping the
  // same bytes in a fresh Uint8Array gives a definite ArrayBuffer-backed
  // view that satisfies both.
  return new NextResponse(new Blob([new Uint8Array(pdfBytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": invoice.status === "draft" ? "no-store" : "private, max-age=3600",
    },
  });
}
