import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInterpreterAuthState } from "@/lib/auth/interpreter";
import { getMyInterpreterInvoice } from "@/lib/interpreter-invoices/queries";
import { downloadStoredInterpreterInvoicePdf } from "@/lib/interpreter-invoices/pdf-storage";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The only place an interpreter ever receives their self-billing PDF bytes.
 * Mirrors app/klant/(portal)/facturen/[id]/pdf/route.ts exactly: never
 * regenerates, only ever serves what is already stored, and
 * getMyInterpreterInvoice() (via my_interpreter_invoices, which is
 * interpreter-id-scoped and excludes drafts) is the sole authorization
 * check - changing the id in the URL can never resolve to another
 * interpreter's invoice.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authState = await getInterpreterAuthState();

  if (authState.status !== "authorized") {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 403 });
  }

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Ongeldige factuur." }, { status: 404 });
  }

  const supabase = await createClient();
  const invoice = await getMyInterpreterInvoice(supabase, id);

  if (!invoice || (invoice.status !== "issued" && invoice.status !== "paid")) {
    return NextResponse.json({ error: "Factuur niet gevonden." }, { status: 404 });
  }

  if (!invoice.pdf_storage_path) {
    return NextResponse.json(
      { error: "De factuur-PDF is nog niet beschikbaar. Neem contact met ons op." },
      { status: 404 },
    );
  }

  const pdfBytes = await downloadStoredInterpreterInvoicePdf(supabase, invoice.pdf_storage_path);

  if (!pdfBytes) {
    return NextResponse.json(
      { error: "De factuur-PDF kon niet worden opgehaald. Neem contact met ons op." },
      { status: 404 },
    );
  }

  return new NextResponse(new Blob([new Uint8Array(pdfBytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number ?? "factuur"}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
