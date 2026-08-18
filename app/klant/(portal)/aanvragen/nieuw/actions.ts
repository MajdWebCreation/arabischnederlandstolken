"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCustomerAction } from "@/lib/auth/customer";
import { formCheckbox, formString } from "@/lib/forms";
import { customerBookingRequestSchema } from "@/lib/customers/portal-schema";
import {
  adminNotifyNewCustomerPortalRequest,
  sendCustomerRequestReceivedEmail,
} from "@/lib/customers/notifications";
import type { FormActionState } from "@/components/admin/admin-action-form";

/**
 * Creates a new booking request (fresh or "Opnieuw boeken") via the sole
 * customer-portal write path, customer_submit_booking_request(). The
 * database is authoritative and is written first; email failure never
 * deletes or rolls back the request (see lib/customers/notifications.ts).
 */
export async function createCustomerBookingRequest(
  repeatedFromBookingId: string | null,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { customer } = await requireCustomerAction();

  const parsed = customerBookingRequestSchema.safeParse({
    languageFrom: formString(formData, "languageFrom"),
    languageTo: formString(formData, "languageTo"),
    languageNotes: formString(formData, "languageNotes"),
    context: formString(formData, "context"),
    modality: formString(formData, "modality"),
    requestedDate: formString(formData, "requestedDate"),
    requestedStartTime: formString(formData, "requestedStartTime"),
    expectedDurationMinutes: formString(formData, "expectedDurationMinutes"),
    locationName: formString(formData, "locationName"),
    locationAddress: formString(formData, "locationAddress"),
    customerMessage: formString(formData, "customerMessage"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: result, error } = await supabase.rpc("customer_submit_booking_request", {
    p_customer_id: customer.id,
    p_language_from: data.languageFrom,
    p_language_to: data.languageTo,
    p_context: data.context,
    p_language_notes: data.languageNotes || undefined,
    p_modality: data.modality || undefined,
    p_sworn_required: formCheckbox(formData, "swornRequired"),
    p_requested_date: data.requestedDate || undefined,
    p_requested_start_time: data.requestedStartTime || undefined,
    p_expected_duration_minutes: data.expectedDurationMinutes
      ? Number(data.expectedDurationMinutes)
      : undefined,
    p_location_name: data.locationName || undefined,
    p_location_address: data.locationAddress || undefined,
    p_customer_message: data.customerMessage || undefined,
    p_repeated_from_booking_id: repeatedFromBookingId ?? undefined,
  });

  if (error || !result || result.length === 0) {
    return { status: "error", message: "Aanvraag versturen is niet gelukt. Probeer het opnieuw." };
  }

  const created = result[0];
  const customerLabel = customer.organisation || customer.name;

  // Best-effort - the request is already safely stored regardless of
  // whether either email actually goes out.
  await sendCustomerRequestReceivedEmail(customer.email, {
    id: created.booking_id,
    booking_number: created.booking_number,
    requested_date: data.requestedDate || null,
    requested_start_time: data.requestedStartTime || null,
    expected_duration_minutes: data.expectedDurationMinutes ? Number(data.expectedDurationMinutes) : null,
    modality: data.modality || null,
    language_from: data.languageFrom,
    language_to: data.languageTo,
    sworn_required: formCheckbox(formData, "swornRequired"),
  });
  await adminNotifyNewCustomerPortalRequest(
    { id: created.booking_id, booking_number: created.booking_number },
    customerLabel,
  );

  revalidatePath("/klant");
  revalidatePath("/klant/opdrachten");
  redirect(`/klant/opdrachten/${created.booking_id}`);
}
