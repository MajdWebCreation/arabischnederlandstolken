"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterAction } from "@/lib/auth/interpreter";
import { sendInterpreterUnavailabilityAdminAlert } from "@/lib/interpreters/notifications";
import type { PortalActionState } from "@/components/portal/portal-action-form";

export async function markAssignmentViewed(assignmentId: string) {
  await requireInterpreterAction();

  const supabase = await createClient();
  // Best-effort: a stale/mismatched id is a safe no-op inside the RPC
  // itself (see its definition), so nothing here needs to branch on error.
  await supabase.rpc("interpreter_mark_assignment_viewed", {
    p_assignment_id: assignmentId,
  });
}

export async function respondToAssignment(
  assignmentId: string,
  response: "interested" | "declined",
): Promise<PortalActionState> {
  await requireInterpreterAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("interpreter_respond_to_assignment", {
    p_assignment_id: assignmentId,
    p_response: response,
  });

  if (error) {
    const message =
      error.message === "assignment_expired"
        ? "De reactietermijn voor deze opdracht is verlopen."
        : error.message === "assignment_already_filled"
          ? "Deze opdracht is inmiddels al aan een andere tolk toegewezen."
          : error.message === "assignment_not_respondable"
            ? "U heeft al gereageerd op deze opdracht."
            : "Reageren is niet gelukt. Probeer het opnieuw.";
    return { status: "error", message };
  }

  revalidatePath(`/tolk/opdrachten/${assignmentId}`);
  revalidatePath("/tolk/opdrachten");
  revalidatePath("/tolk");

  return {
    status: "success",
    message:
      response === "interested"
        ? "Uw interesse is doorgegeven."
        : "U heeft deze opdracht afgewezen.",
  };
}

/**
 * "Ik ben verhinderd" for a confirmed assignment (Phase 4 brief section
 * 27). Deliberately does not cancel or change anything about the booking
 * itself - see interpreter_report_unavailable() - it only flags the
 * assignment for urgent admin attention so a replacement can be arranged
 * while the customer's booking stays intact.
 */
export async function reportUnavailable(
  bookingId: string,
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireInterpreterAction();

  const reason = formData.get("reason");
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("booking_number")
    .eq("id", bookingId)
    .maybeSingle();

  const { error } = await supabase.rpc("interpreter_report_unavailable", {
    p_booking_id: bookingId,
    p_reason: typeof reason === "string" && reason.trim() ? reason.trim() : undefined,
  });

  if (error) {
    const message =
      error.message === "already_reported"
        ? "U heeft dit al gemeld voor deze opdracht."
        : error.message === "booking_not_confirmed"
          ? "Deze opdracht is niet (meer) bevestigd."
          : "Melden is niet gelukt. Probeer het opnieuw.";
    return { status: "error", message };
  }

  if (booking?.booking_number) {
    await sendInterpreterUnavailabilityAdminAlert(booking.booking_number, bookingId);
  }

  revalidatePath(`/tolk/opdrachten/booking-${bookingId}`);
  revalidatePath("/tolk/opdrachten");
  revalidatePath("/tolk");

  return {
    status: "success",
    message: "Uw melding is doorgegeven aan de beheerder.",
  };
}
