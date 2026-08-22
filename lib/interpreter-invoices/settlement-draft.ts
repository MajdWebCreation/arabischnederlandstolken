import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type CreateSettlementDraftResult =
  | { status: "created"; invoiceId: string }
  | { status: "error"; message: string };

/**
 * The one place a draft settlement is ever created from a completed
 * booking's final, confirmed interpreter - never any other candidate
 * (brief section 25). Shared by the "Afrekening maken" admin action
 * (app/admin/(dashboard)/interpreter-invoices/[id]/actions.ts) and the
 * booking-completion wizard (app/admin/(dashboard)/bookings/[id]/actions.ts),
 * so completing a booking never duplicates this logic - it just calls the
 * same function. Pre-fills suggested tolkenvergoeding/reiskosten line items
 * from bookings.interpreter_cost_ex_vat/interpreter_travel_cost_ex_vat (the
 * amount admin just confirmed), which admin must still see and confirm/edit
 * again before sending to the interpreter (brief section 6) - this never
 * sends or issues anything itself.
 */
export async function createSettlementDraftForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<CreateSettlementDraftResult> {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, status, interpreter_id, interpreter_cost_ex_vat, interpreter_travel_cost_ex_vat")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return { status: "error", message: "Boeking niet gevonden." };
  }

  if (booking.status !== "completed") {
    return { status: "error", message: "Alleen voor afgeronde boekingen kan een afrekening worden gemaakt." };
  }

  if (!booking.interpreter_id) {
    return { status: "error", message: "Deze boeking heeft geen definitief toegewezen tolk." };
  }

  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("vat_treatment")
    .eq("id", booking.interpreter_id)
    .maybeSingle();

  const { data: invoice, error } = await supabase
    .from("interpreter_invoices")
    .insert({
      interpreter_id: booking.interpreter_id,
      booking_id: booking.id,
      vat_treatment_snapshot: interpreter?.vat_treatment ?? null,
      vat_rate: interpreter?.vat_treatment === "standard_vat" ? 21 : null,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    return {
      status: "error",
      message:
        error?.code === "23505"
          ? "Er bestaat al een actieve afrekening voor deze boeking."
          : "Afrekening aanmaken is niet gelukt.",
    };
  }

  const suggestedItems: {
    interpreter_invoice_id: string;
    sort_order: number;
    description: string;
    quantity: number;
    unit: string;
    unit_price_ex_vat: number;
  }[] = [];

  if (booking.interpreter_cost_ex_vat !== null) {
    suggestedItems.push({
      interpreter_invoice_id: invoice.id,
      sort_order: 0,
      description: "Tolkenvergoeding",
      quantity: 1,
      unit: "vast",
      unit_price_ex_vat: booking.interpreter_cost_ex_vat,
    });
  }

  if (booking.interpreter_travel_cost_ex_vat) {
    suggestedItems.push({
      interpreter_invoice_id: invoice.id,
      sort_order: 1,
      description: "Reiskosten",
      quantity: 1,
      unit: "vast",
      unit_price_ex_vat: booking.interpreter_travel_cost_ex_vat,
    });
  }

  if (suggestedItems.length > 0) {
    await supabase.from("interpreter_invoice_items").insert(suggestedItems);
  }

  return { status: "created", invoiceId: invoice.id };
}
