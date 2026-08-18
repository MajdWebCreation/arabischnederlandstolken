import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCustomerAuthState } from "@/lib/auth/customer";
import { getMyIssuedInvoicePdfPath } from "@/lib/customers/portal-queries";
import { downloadStoredInvoicePdf } from "@/lib/invoices/pdf-storage";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The only place a customer ever receives invoice PDF bytes. Deliberately
 * narrower than the admin PDF route
 * (app/admin/(dashboard)/invoices/[id]/pdf/route.ts): it never renders a
 * draft (get_my_issued_invoice_pdf_path() already refuses those) and it
 * never regenerates a missing document - a customer only ever gets back
 * exactly the immutable bytes Phase 3A already stored, or a clear "not yet
 * available" response. Regeneration-on-demand stays an admin-only
 * capability, on purpose - see downloadStoredInvoicePdf()'s own comment.
 *
 * This route sits under /klant, which the proxy matcher covers, but - like
 * every other admin/interpreter/customer route and Server Action in this
 * app - that is only a session-refresh convenience; authorization is
 * re-checked here from scratch, and the actual data-access boundary is the
 * database (get_my_issued_invoice_pdf_path() plus the matching
 * storage.objects RLS policy), not this check alone.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authState = await getCustomerAuthState();

  if (authState.status !== "authorized") {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 403 });
  }

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Ongeldige factuur." }, { status: 404 });
  }

  const supabase = await createClient();
  const invoiceRef = await getMyIssuedInvoicePdfPath(supabase, id);

  if (!invoiceRef) {
    return NextResponse.json({ error: "Factuur niet gevonden." }, { status: 404 });
  }

  if (!invoiceRef.pdfStoragePath) {
    return NextResponse.json(
      { error: "De factuur-PDF is nog niet beschikbaar. Neem contact met ons op." },
      { status: 404 },
    );
  }

  const pdfBytes = await downloadStoredInvoicePdf(supabase, invoiceRef.pdfStoragePath);

  if (!pdfBytes) {
    return NextResponse.json(
      { error: "De factuur-PDF kon niet worden opgehaald. Neem contact met ons op." },
      { status: 404 },
    );
  }

  return new NextResponse(new Blob([new Uint8Array(pdfBytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceRef.invoiceNumber}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
