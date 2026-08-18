"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import { inviteInterpreterSchema, publishOpenAssignmentSchema } from "@/lib/assignments/schema";
import { centsToNumber, parseMoneyInputToCents, requiredCentsToNumber } from "@/lib/money";
import { getBookingById } from "@/lib/bookings/queries";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import { buildServiceLineDescription, TRAVEL_LINE_DESCRIPTION } from "@/lib/invoices/description";
import { listInterpretersForMatching, matchInterpreters } from "@/lib/interpreters/matching";
import {
  sendAssignmentInvitationEmail,
  sendAssignmentSelectedEmail,
  sendAssignmentWithdrawnEmail,
  sendInterpreterBookingCancelledEmail,
} from "@/lib/interpreters/notifications";
import {
  sendCustomerActionRequiredEmail,
  sendCustomerBookingConfirmedEmail,
  sendCustomerCancellationApprovedEmail,
  sendCustomerReplacementInterpreterEmail,
} from "@/lib/customers/notifications";
import type { FormActionState } from "@/components/admin/admin-action-form";

/**
 * Fetches the booking/customer/interpreter data a customer confirmation
 * email needs and sends the right template - "definitively confirmed" for
 * a first assignment, "replacement interpreter confirmed" when a
 * previously assigned interpreter is being swapped for another. Shared by
 * both admin paths that can finally assign an interpreter: the "recruit
 * candidates" RPC flow (selectInterpreterForBooking) and the quick direct
 * dropdown (updateBookingInterpreter) - see each call site below for why
 * both need this, not just the RPC-driven one.
 */
async function notifyCustomerOfInterpreterAssignment(
  bookingId: string,
  isReplacement: boolean,
) {
  const supabase = await createClient();
  const booking = await getBookingById(supabase, bookingId);

  if (!booking || !booking.interpreter) {
    return;
  }

  const emailBooking = {
    id: booking.id,
    booking_number: booking.booking_number,
    requested_date: booking.requested_date,
    requested_start_time: booking.requested_start_time,
    expected_duration_minutes: booking.expected_duration_minutes,
    modality: booking.modality,
    language_from: booking.language_from,
    language_to: booking.language_to,
    sworn_required: booking.sworn_required,
    customer_price_ex_vat: booking.customer_price_ex_vat,
    customer_overtime_rate_ex_vat: booking.customer_overtime_rate_ex_vat,
  };

  const interpreter = {
    first_name: booking.interpreter.first_name,
    last_name: booking.interpreter.last_name,
    phone: booking.interpreter.phone,
    rbtv_number: booking.interpreter.rbtv_number,
  };

  const sent = isReplacement
    ? await sendCustomerReplacementInterpreterEmail(booking.customer.email, emailBooking, interpreter, booking.customer.name)
    : await sendCustomerBookingConfirmedEmail(booking.customer.email, emailBooking, interpreter, booking.customer.name);

  if (sent) {
    await supabase.from("booking_events").insert({
      booking_id: bookingId,
      event_type: "customer_confirmation_sent",
      description: isReplacement
        ? "Bevestiging vervangende tolk per e-mail naar klant verstuurd."
        : "Definitieve bevestiging per e-mail naar klant verstuurd.",
    });
  }
}

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
  const booking = await getBookingById(supabase, bookingId);
  const previousStatus = booking?.status;

  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Status bijwerken is niet gelukt." };
  }

  // The moment admin marks customer-facing terms as ready ('quoted'), the
  // customer portal shows an "Opdrachtvoorstel" awaiting Akkoord/Wijziging
  // aanvragen (see customer_accept_booking_offer()) - this is the
  // "action/acceptance required" email from the Phase 4 brief's email
  // template list. Only fires on the actual transition into 'quoted', not
  // on every subsequent save while already 'quoted'.
  if (parsed.data.status === "quoted" && previousStatus !== "quoted" && booking) {
    const sent = await sendCustomerActionRequiredEmail(booking.customer.email, {
      id: booking.id,
      booking_number: booking.booking_number,
      requested_date: booking.requested_date,
      requested_start_time: booking.requested_start_time,
      expected_duration_minutes: booking.expected_duration_minutes,
      modality: booking.modality,
      language_from: booking.language_from,
      language_to: booking.language_to,
      sworn_required: booking.sworn_required,
      customer_price_ex_vat: booking.customer_price_ex_vat,
      customer_travel_fee_ex_vat: booking.customer_travel_fee_ex_vat,
    });

    if (sent) {
      await supabase.from("booking_events").insert({
        booking_id: bookingId,
        event_type: "customer_offer_sent",
        description: "Opdrachtvoorstel per e-mail naar klant verstuurd.",
      });
    }
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Status bijgewerkt." };
}

export async function updateBookingInterpreter(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { user } = await requireAdminAction();

  const parsed = bookingInterpreterAssignmentSchema.safeParse({
    interpreterId: formString(formData, "interpreterId"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Ongeldige tolk geselecteerd." };
  }

  const supabase = await createClient();
  const before = await getBookingById(supabase, bookingId);
  const previousInterpreterId = before?.interpreter_id ?? null;
  const wasConfirmed = before ? ["interpreter_confirmed", "confirmed"].includes(before.status) : false;

  const { error } = await supabase
    .from("bookings")
    .update({ interpreter_id: parsed.data.interpreterId || null })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Tolktoewijzing bijwerken is niet gelukt." };
  }

  const newInterpreterId = parsed.data.interpreterId || null;

  if (newInterpreterId && newInterpreterId !== previousInterpreterId) {
    // Replacing a previously confirmed interpreter (Phase 4 brief section
    // 28) resolves the unavailability report(s) that prompted it and gets
    // the customer-facing "replacement confirmed" email instead of the
    // ordinary first-confirmation one; a genuinely first assignment
    // (previousInterpreterId is null) gets the ordinary confirmation.
    const isReplacement = Boolean(previousInterpreterId) && wasConfirmed;

    if (isReplacement) {
      await supabase
        .from("interpreter_unavailability_reports")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by_user_id: user.id,
          replacement_interpreter_id: newInterpreterId,
        })
        .eq("booking_id", bookingId)
        .eq("status", "open");

      await supabase.from("booking_events").insert({
        booking_id: bookingId,
        event_type: "replacement_interpreter_selected",
        description: "Vervangende tolk toegewezen.",
        metadata: { previous_interpreter_id: previousInterpreterId, new_interpreter_id: newInterpreterId },
        created_by: user.id,
      });
    }

    await notifyCustomerOfInterpreterAssignment(bookingId, isReplacement);

    const { data: interpreter } = await supabase
      .from("interpreters")
      .select("email")
      .eq("id", newInterpreterId)
      .maybeSingle();
    if (interpreter?.email) {
      await sendAssignmentSelectedEmail(interpreter.email);
    }
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
    requiredDialectTagId: formString(formData, "requiredDialectTagId"),
    onsiteContactName: formString(formData, "onsiteContactName"),
    onsiteContactPhone: formString(formData, "onsiteContactPhone"),
    interpreterBrief: formString(formData, "interpreterBrief"),
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
      required_dialect_tag_id: data.requiredDialectTagId || null,
      onsite_contact_name: nullIfBlank(data.onsiteContactName ?? ""),
      onsite_contact_phone: nullIfBlank(data.onsiteContactPhone ?? ""),
      interpreter_brief: nullIfBlank(data.interpreterBrief ?? ""),
    })
    .eq("id", bookingId);

  if (error) {
    return { status: "error", message: "Boekingsgegevens bijwerken is niet gelukt." };
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Boekingsgegevens bijgewerkt." };
}

export async function inviteInterpreterToBooking(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = inviteInterpreterSchema.safeParse({
    interpreterId: formString(formData, "interpreterId"),
    offeredCompensationExVat: formString(formData, "offeredCompensationExVat"),
    offeredTravelCompensationExVat: formString(formData, "offeredTravelCompensationExVat"),
    messageToInterpreter: formString(formData, "messageToInterpreter"),
    expiresAt: formString(formData, "expiresAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("email")
    .eq("id", parsed.data.interpreterId)
    .maybeSingle();

  const { error } = await supabase.from("booking_assignments").insert({
    booking_id: bookingId,
    interpreter_id: parsed.data.interpreterId,
    assignment_type: "direct",
    offered_compensation_ex_vat: requiredCentsToNumber(parsed.data.offeredCompensationExVat),
    offered_travel_compensation_ex_vat: centsToNumber(parsed.data.offeredTravelCompensationExVat),
    message_to_interpreter: nullIfBlank(parsed.data.messageToInterpreter),
    expires_at: parsed.data.expiresAt ? new Date(parsed.data.expiresAt).toISOString() : null,
    invited_at: new Date().toISOString(),
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "Deze tolk is al kandidaat voor deze boeking."
        : "Uitnodigen is niet gelukt.";
    return { status: "error", message };
  }

  if (interpreter?.email) {
    await sendAssignmentInvitationEmail(interpreter.email);
  }

  revalidateBooking(bookingId);
  return { status: "success", message: "Tolk uitgenodigd." };
}

export async function publishOpenAssignment(
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { user } = await requireAdminAction();

  const parsed = publishOpenAssignmentSchema.safeParse({
    offeredCompensationExVat: formString(formData, "offeredCompensationExVat"),
    offeredTravelCompensationExVat: formString(formData, "offeredTravelCompensationExVat"),
    description: formString(formData, "description"),
    expiresAt: formString(formData, "expiresAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const booking = await getBookingById(supabase, bookingId);

  if (!booking) {
    return { status: "error", message: "Boeking niet gevonden." };
  }

  if (!booking.requested_date || !booking.requested_start_time) {
    return {
      status: "error",
      message: "Stel eerst een datum en tijd in voordat u deze boeking publiceert.",
    };
  }

  const interpreters = await listInterpretersForMatching(supabase);
  const dialectTag = booking.required_dialect_tag_id
    ? interpreters
        .flatMap((i) => i.interpreter_capabilities)
        .map((c) => c.capability_tags)
        .find((tag) => tag?.id === booking.required_dialect_tag_id) ?? null
    : null;

  const matches = matchInterpreters(booking, interpreters, dialectTag);
  const eligibleIds = new Set(
    matches.filter((match) => match.eligible).map((match) => match.interpreter.id),
  );

  const { data: existingRows } = await supabase
    .from("booking_assignments")
    .select("interpreter_id")
    .eq("booking_id", bookingId);
  const alreadyInvitedIds = new Set((existingRows ?? []).map((row) => row.interpreter_id));

  const newInterpreterIds = [...eligibleIds].filter((id) => !alreadyInvitedIds.has(id));

  if (newInterpreterIds.length === 0) {
    return {
      status: "error",
      message: "Geen nieuwe geschikte tolken gevonden om te publiceren.",
    };
  }

  const nowIso = new Date().toISOString();
  const { error: insertError } = await supabase.from("booking_assignments").insert(
    newInterpreterIds.map((interpreterId) => ({
      booking_id: bookingId,
      interpreter_id: interpreterId,
      assignment_type: "open" as const,
      offered_compensation_ex_vat: requiredCentsToNumber(parsed.data.offeredCompensationExVat),
      offered_travel_compensation_ex_vat: centsToNumber(
        parsed.data.offeredTravelCompensationExVat,
      ),
      expires_at: parsed.data.expiresAt ? new Date(parsed.data.expiresAt).toISOString() : null,
      invited_at: nowIso,
    })),
  );

  if (insertError) {
    return { status: "error", message: "Publiceren is niet gelukt." };
  }

  await supabase
    .from("bookings")
    .update({
      is_open_assignment: true,
      open_assignment_published_at: nowIso,
      interpreter_brief: nullIfBlank(parsed.data.description) ?? booking.interpreter_brief,
    })
    .eq("id", bookingId);

  // One consolidated event for the whole batch - see the trigger's own
  // comment for why per-row "open" inserts are deliberately not logged there.
  await supabase.from("booking_events").insert({
    booking_id: bookingId,
    event_type: "open_assignment_published",
    metadata: {
      interpreter_count: newInterpreterIds.length,
      interpreter_ids: newInterpreterIds,
    },
    created_by: user.id,
  });

  const invitedEmails = interpreters
    .filter((interpreter) => newInterpreterIds.includes(interpreter.id))
    .map((interpreter) => interpreter.email);
  await Promise.all(invitedEmails.map((email) => sendAssignmentInvitationEmail(email)));

  revalidateBooking(bookingId);
  return {
    status: "success",
    message: `Gepubliceerd naar ${newInterpreterIds.length} geschikte tolk(en).`,
  };
}

export async function withdrawAssignment(bookingId: string, assignmentId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("booking_assignments")
    .select("interpreter:interpreters(email)")
    .eq("id", assignmentId)
    .maybeSingle();

  const { error } = await supabase
    .from("booking_assignments")
    .update({ status: "withdrawn" })
    .eq("id", assignmentId)
    .eq("booking_id", bookingId)
    .in("status", ["invited", "viewed", "interested"]);

  if (error) {
    throw new Error("Intrekken is niet gelukt.");
  }

  const interpreterEmail = assignment?.interpreter?.email;
  if (interpreterEmail) {
    await sendAssignmentWithdrawnEmail(interpreterEmail);
  }

  revalidateBooking(bookingId);
}

export async function selectInterpreterForBooking(bookingId: string, assignmentId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const before = await getBookingById(supabase, bookingId);
  const wasReplacement = Boolean(before?.interpreter_id) &&
    ["interpreter_confirmed", "confirmed"].includes(before?.status ?? "");

  const { data: assignment } = await supabase
    .from("booking_assignments")
    .select("interpreter:interpreters(email)")
    .eq("id", assignmentId)
    .maybeSingle();

  const { error } = await supabase.rpc("select_interpreter_for_booking", {
    p_booking_id: bookingId,
    p_assignment_id: assignmentId,
  });

  if (error) {
    throw new Error("Tolk selecteren is niet gelukt.");
  }

  const interpreterEmail = assignment?.interpreter?.email;
  if (interpreterEmail) {
    await sendAssignmentSelectedEmail(interpreterEmail);
  }

  // Never merely on interpreter interest (Phase 2's interested != selected
  // distinction is preserved untouched) - only here, once admin has
  // actually finalised the selection, does the customer get told.
  await notifyCustomerOfInterpreterAssignment(bookingId, wasReplacement);

  revalidateBooking(bookingId);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Creates a draft invoice from a booking's existing customer-facing
 * amounts, with sensible default line items (service + travel, if any) so
 * nothing already on the booking has to be retyped. Never touches
 * interpreter_cost_ex_vat or any interpreter-side field - only the
 * customer_price_ex_vat/customer_travel_fee_ex_vat/vat_rate a customer
 * invoice is actually built from.
 */
export async function createDraftInvoiceFromBooking(bookingId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const booking = await getBookingById(supabase, bookingId);

  if (!booking) {
    throw new Error("Boeking niet gevonden.");
  }

  if (booking.customer_price_ex_vat === null) {
    throw new Error("Stel eerst een klantprijs in bij Financiën voordat u een factuur aanmaakt.");
  }

  const businessSettings = await getBusinessSettings(supabase);
  const invoiceDate = new Date().toISOString().slice(0, 10);

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      customer_id: booking.customer_id,
      booking_id: booking.id,
      invoice_date: invoiceDate,
      due_date: addDays(invoiceDate, businessSettings.payment_term_days),
      payment_term_days: businessSettings.payment_term_days,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    throw new Error("Conceptfactuur aanmaken is niet gelukt.");
  }

  const items = [
    {
      invoice_id: invoice.id,
      position: 0,
      description: buildServiceLineDescription(booking),
      quantity: 1,
      unit_price_ex_vat: booking.customer_price_ex_vat,
      vat_rate: booking.vat_rate,
    },
  ];

  if (booking.customer_travel_fee_ex_vat) {
    items.push({
      invoice_id: invoice.id,
      position: 1,
      description: TRAVEL_LINE_DESCRIPTION,
      quantity: 1,
      unit_price_ex_vat: booking.customer_travel_fee_ex_vat,
      vat_rate: booking.vat_rate,
    });
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(items);

  if (itemsError) {
    throw new Error("Factuurregels aanmaken is niet gelukt.");
  }

  revalidateBooking(bookingId);
  redirect(`/admin/invoices/${invoice.id}`);
}

/**
 * Admin decision on a pending cancellation_requests row (Phase 4 brief
 * section 26). The charge fields are always exactly what admin typed here
 * - never calculated - matching admin_review_cancellation_request()'s own
 * guarantee. On approval, the booking's own status_changed event is
 * logged automatically by the existing log_booking_changes trigger; this
 * action only adds the customer/interpreter email side effects the RPC
 * itself deliberately leaves to application code (same split as every
 * other admin action in this file).
 */
export async function reviewCancellationRequest(
  bookingId: string,
  requestId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const decision = formString(formData, "decision");
  if (decision !== "approved" && decision !== "rejected") {
    return { status: "error", message: "Kies goedkeuren of afwijzen." };
  }

  const chargeAmountCents = parseMoneyInputToCents(formString(formData, "chargeAmountExVat"));
  if (chargeAmountCents === undefined) {
    return { status: "error", message: "Vul een geldig annuleringsbedrag in, of laat het veld leeg." };
  }
  const chargeAmount = chargeAmountCents === null ? null : requiredCentsToNumber(chargeAmountCents);

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_cancellation_request", {
    p_request_id: requestId,
    p_decision: decision,
    p_charge_amount_ex_vat: chargeAmount ?? undefined,
    p_charge_waived: formCheckbox(formData, "chargeWaived"),
    p_admin_decision_note: nullIfBlank(formString(formData, "adminDecisionNote")) ?? undefined,
  });

  if (error) {
    const message =
      error.message === "cancellation_request_already_reviewed"
        ? "Dit verzoek is al beoordeeld."
        : "Beoordelen is niet gelukt.";
    return { status: "error", message };
  }

  if (decision === "approved") {
    const booking = await getBookingById(supabase, bookingId);
    if (booking) {
      await sendCustomerCancellationApprovedEmail(booking.customer.email, {
        id: booking.id,
        booking_number: booking.booking_number,
        requested_date: booking.requested_date,
        requested_start_time: booking.requested_start_time,
        expected_duration_minutes: booking.expected_duration_minutes,
        modality: booking.modality,
        language_from: booking.language_from,
        language_to: booking.language_to,
        sworn_required: booking.sworn_required,
      });

      if (booking.interpreter?.email) {
        await sendInterpreterBookingCancelledEmail(booking.interpreter.email);
      }
    }
  }

  revalidateBooking(bookingId);
  return {
    status: "success",
    message: decision === "approved" ? "Annulering goedgekeurd." : "Annuleringsverzoek afgewezen.",
  };
}
