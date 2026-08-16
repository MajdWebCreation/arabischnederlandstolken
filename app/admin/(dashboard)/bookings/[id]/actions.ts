"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formCheckbox, formString, nullIfBlank } from "@/lib/forms";
import {
  bookingDetailsSchema,
  bookingFinancialsSchema,
  bookingInternalNotesSchema,
  bookingInterpreterAssignmentSchema,
  bookingStatusSchema,
} from "@/lib/bookings/schema";
import { centsToNumber } from "@/lib/money";
import type { FormActionState } from "@/components/admin/admin-action-form";

// Status/interpreter/financial changes are logged to booking_events
// automatically by the log_booking_changes database trigger (see
// supabase/migrations/20260814100700_booking_change_log.sql) - these
// actions only need to write the update itself.
function revalidateBooking(bookingId: string) {
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function updateBookingStatus(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = bookingStatusSchema.safeParse({
    status: formString(formData, "status"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Kies een geldige status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Status bijwerken is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Status bijgewerkt." };
}

export async function updateBookingInterpreter(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = bookingInterpreterAssignmentSchema.safeParse({
    interpreterId: formString(formData, "interpreterId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Ongeldige tolk geselecteerd." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ interpreter_id: parsed.data.interpreterId || null })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Tolktoewijzing bijwerken is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return {
    status: "success",
    message: parsed.data.interpreterId
      ? "Tolk toegewezen."
      : "Tolk verwijderd van deze boeking.",
  };
}

export async function updateBookingFinancials(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = bookingFinancialsSchema.safeParse({
    customerPriceExVat: formString(formData, "customerPriceExVat"),
    interpreterCostExVat: formString(formData, "interpreterCostExVat"),
    customerTravelFeeExVat: formString(formData, "customerTravelFeeExVat"),
    interpreterTravelCostExVat: formString(formData, "interpreterTravelCostExVat"),
    customerOvertimeRateExVat: formString(formData, "customerOvertimeRateExVat"),
    interpreterOvertimeRateExVat: formString(formData, "interpreterOvertimeRateExVat"),
    vatRate: formString(formData, "vatRate"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      status: "error",
      message: firstIssue?.message ?? "Controleer de ingevulde bedragen.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      customer_price_ex_vat: centsToNumber(parsed.data.customerPriceExVat),
      interpreter_cost_ex_vat: centsToNumber(parsed.data.interpreterCostExVat),
      customer_travel_fee_ex_vat: centsToNumber(parsed.data.customerTravelFeeExVat),
      interpreter_travel_cost_ex_vat: centsToNumber(parsed.data.interpreterTravelCostExVat),
      customer_overtime_rate_ex_vat: centsToNumber(parsed.data.customerOvertimeRateExVat),
      interpreter_overtime_rate_ex_vat: centsToNumber(parsed.data.interpreterOvertimeRateExVat),
      vat_rate: parsed.data.vatRate,
    })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Financiële gegevens bijwerken is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Financiële gegevens bijgewerkt." };
}

export async function updateBookingInternalNotes(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = bookingInternalNotesSchema.safeParse({
    internalNotes: formString(formData, "internalNotes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige notitie.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ internal_notes: nullIfBlank(parsed.data.internalNotes) })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Notitie opslaan is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Interne notitie opgeslagen." };
}

export async function updateBookingDetails(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = bookingDetailsSchema.safeParse({
    requestedDate: formString(formData, "requestedDate"),
    requestedStartTime: formString(formData, "requestedStartTime"),
    expectedDurationMinutes: formString(formData, "expectedDurationMinutes"),
    actualDurationMinutes: formString(formData, "actualDurationMinutes"),
    locationName: formString(formData, "locationName"),
    locationAddress: formString(formData, "locationAddress"),
    languageNotes: formString(formData, "languageNotes"),
    modality: formString(formData, "modality"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      requested_date: data.requestedDate || null,
      requested_start_time: data.requestedStartTime || null,
      expected_duration_minutes: data.expectedDurationMinutes
        ? Number(data.expectedDurationMinutes)
        : null,
      actual_duration_minutes: data.actualDurationMinutes
        ? Number(data.actualDurationMinutes)
        : null,
      location_name: nullIfBlank(data.locationName ?? ""),
      location_address: nullIfBlank(data.locationAddress ?? ""),
      language_notes: nullIfBlank(data.languageNotes ?? ""),
      modality: data.modality || null,
      sworn_required: formCheckbox(formData, "swornRequired"),
    })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Boekingsgegevens bijwerken is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Boekingsgegevens bijgewerkt." };
}
