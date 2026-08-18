import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminAuthState } from "@/lib/auth/admin";
import { getInterpreterInvoiceById } from "@/lib/interpreter-invoices/queries";
import { getIssuedInterpreterInvoicePdfBuffer } from "@/lib/interpreter-invoices/pdf-storage";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Admin PDF route, mirroring app/admin/(dashboard)/invoices/[id]/pdf/route.ts.
 * Unlike that one, there is no live-draft-preview branch here - a
 * not-yet-issued settlement has no PDF at all (see pdf-render.ts), so this
 * only ever serves the stored/regenerated document for status='issued'/'paid'.
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
  const invoice = await getInterpreterInvoiceById(supabase, id);

  if (!invoice) {
    return NextResponse.json({ error: "Factuur niet gevonden." }, { status: 404 });
  }

  if (invoice.status !== "issued" && invoice.status !== "paid") {
    return NextResponse.json({ error: "Deze factuur is nog niet definitief." }, { status: 404 });
  }

  const pdfBytes = await getIssuedInterpreterInvoicePdfBuffer(supabase, invoice);
  const filename = `${invoice.invoice_number ?? "factuur"}.pdf`;

  return new NextResponse(new Blob([new Uint8Array(pdfBytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
