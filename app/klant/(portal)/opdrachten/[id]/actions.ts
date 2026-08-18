"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCustomerAction } from "@/lib/auth/customer";
import { formCheckbox, formString } from "@/lib/forms";
import {
  cancellationReasonSchema,
  offerChangeRequestSchema,
} from "@/lib/customers/portal-schema";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/terms";
import { getMyCustomerBooking } from "@/lib/customers/portal-queries";
import { sendCustomerCancellationRequestReceivedEmail } from "@/lib/customers/notifications";
import type { PortalActionState } from "@/components/portal/portal-action-form";

function revalidateBooking(bookingId: string) {
  revalidatePath(`/klant/opdrachten/${bookingId}`);
  revalidatePath("/klant/opdrachten");
  revalidatePath("/klant");
}

const RPC_ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "Deze opdracht is niet (meer) bij uw account bekend.",
  booking_not_awaiting_acceptance: "Deze opdracht wacht niet (meer) op uw bevestiging.",
  early_performance_consent_required:
    "Vink de toestemming voor start binnen de bedenktijd aan om akkoord te gaan.",
  terms_version_required: "Er ging iets mis met de algemene voorwaarden. Probeer het opnieuw.",
  message_required: "Beschrijf kort welke wijziging u wilt.",
  booking_already_confirmed: "Deze aanvraag is al bevestigd en kan niet meer direct worden ingetrokken.",
  invalid_request_type: "Ongeldig verzoek.",
  consumer_withdrawal_requires_individual_customer:
    "Het herroepingsrecht geldt alleen voor particuliere klanten.",
  no_accepted_contract_to_withdraw_from: "Er is nog geen geaccepteerde opdracht om te herroepen.",
  booking_not_withdrawable: "Deze opdracht komt niet (meer) in aanmerking voor herroeping.",
  booking_not_cancellable: "Deze opdracht kan op dit moment niet worden geannuleerd.",
  cancellation_request_already_pending: "Er staat al een verzoek voor deze opdracht open.",
};

function friendlyRpcError(message: string | undefined): string {
  return (message && RPC_ERROR_MESSAGES[message]) || "Actie is niet gelukt. Probeer het opnieuw.";
}

export async function acceptBookingOffer(
  bookingId: string,
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireCustomerAction();

  if (!formCheckbox(formData, "termsAccepted")) {
    return {
      status: "error",
      message: "Vink aan dat u akkoord gaat en kennis heeft genomen van de algemene voorwaarden.",
    };
  }

  const earlyPerformanceConsent = formCheckbox(formData, "earlyPerformanceConsent");
  const earlyPerformanceFullCompletionAck = formCheckbox(formData, "earlyPerformanceFullCompletionAck");

  const supabase = await createClient();
  const { error } = await supabase.rpc("customer_accept_booking_offer", {
    p_booking_id: bookingId,
    p_terms_version: CURRENT_TERMS_VERSION,
    p_early_performance_consent: earlyPerformanceConsent,
    p_early_performance_full_completion_ack: earlyPerformanceFullCompletionAck,
  });

  if (error) {
    return { status: "error", message: friendlyRpcError(error.message) };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "U bent akkoord gegaan met de opdracht." };
}

export async function requestBookingChange(
  bookingId: string,
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireCustomerAction();

  const parsed = offerChangeRequestSchema.safeParse({ message: formString(formData, "message") });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Vul een toelichting in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("customer_request_booking_change", {
    p_booking_id: bookingId,
    p_message: parsed.data.message,
  });

  if (error) {
    return { status: "error", message: friendlyRpcError(error.message) };
  }

  revalidateBooking(bookingId);
  return {
    status: "success",
    message: "Uw wijzigingsverzoek is doorgegeven. We nemen het opdrachtvoorstel opnieuw met u door.",
  };
}

export async function withdrawPendingRequest(
  bookingId: string,
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireCustomerAction();

  const parsed = cancellationReasonSchema.safeParse({ reason: formString(formData, "reason") });
  const reason = parsed.success ? parsed.data.reason : "";

  const supabase = await createClient();
  const { error } = await supabase.rpc("customer_withdraw_pending_request", {
    p_booking_id: bookingId,
    p_reason: reason || undefined,
  });

  if (error) {
    return { status: "error", message: friendlyRpcError(error.message) };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Uw aanvraag is ingetrokken." };
}

export async function requestCancellation(
  bookingId: string,
  requestType: "cancellation" | "consumer_withdrawal",
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { customer } = await requireCustomerAction();

  const parsed = cancellationReasonSchema.safeParse({ reason: formString(formData, "reason") });
  const reason = parsed.success ? parsed.data.reason : "";

  const supabase = await createClient();
  const { error } = await supabase.rpc("customer_request_cancellation", {
    p_booking_id: bookingId,
    p_request_type: requestType,
    p_reason: reason || undefined,
  });

  if (error) {
    return { status: "error", message: friendlyRpcError(error.message) };
  }

  const booking = await getMyCustomerBooking(supabase, bookingId);
  if (booking) {
    await sendCustomerCancellationRequestReceivedEmail(customer.email, {
      id: booking.booking_id,
      booking_number: booking.booking_number,
      requested_date: booking.requested_date,
      requested_start_time: booking.requested_start_time,
      expected_duration_minutes: booking.expected_duration_minutes,
      modality: booking.modality,
      language_from: booking.language_from,
      language_to: booking.language_to,
      sworn_required: booking.sworn_required,
    });
  }

  revalidateBooking(bookingId);
  return {
    status: "success",
    message:
      requestType === "consumer_withdrawal"
        ? "Uw beroep op het herroepingsrecht is doorgegeven."
        : "Uw annuleringsverzoek is doorgegeven.",
  };
}
