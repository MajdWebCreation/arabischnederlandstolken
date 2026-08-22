"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formString } from "@/lib/forms";
import {
  interpreterInvoiceItemSchema,
  updateInterpreterInvoiceVatSchema,
} from "@/lib/interpreter-invoices/schema";
import { getInterpreterInvoiceById } from "@/lib/interpreter-invoices/queries";
import { createSettlementDraftForBooking } from "@/lib/interpreter-invoices/settlement-draft";
import { getIssuedInterpreterInvoicePdfBuffer } from "@/lib/interpreter-invoices/pdf-storage";
import {
  sendSettlementReadyForReviewEmail,
  sendSettlementResubmittedEmail,
  sendInterpreterInvoiceIssuedEmail,
  sendInterpreterInvoicePaidEmail,
} from "@/lib/interpreter-invoices/notifications";
import { sendProfileCompletionReminderEmail } from "@/lib/interpreters/notifications";
import { requiredCentsToNumber, formatNumberAsCurrency } from "@/lib/money";
import { interpreterInvoiceErrorMessage } from "@/lib/interpreter-invoices/constants";
import { CURRENT_SELF_BILLING_TERMS_VERSION } from "@/lib/legal/terms";
import type { FormActionState } from "@/components/admin/admin-action-form";

function formatDateLabel(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function revalidateInterpreterInvoice(invoiceId: string, bookingId?: string) {
  revalidatePath(`/admin/interpreter-invoices/${invoiceId}`);
  revalidatePath("/admin/interpreter-invoices");
  if (bookingId) {
    revalidatePath(`/admin/bookings/${bookingId}`);
  }
}

/** "Afrekening maken" on the booking page - see createSettlementDraftForBooking() for the actual logic, also used by the booking-completion wizard. */
export async function createInterpreterSettlementDraft(bookingId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const result = await createSettlementDraftForBooking(supabase, bookingId);

  if (result.status === "error") {
    throw new Error(result.message);
  }

  revalidateInterpreterInvoice(result.invoiceId, bookingId);
  redirect(`/admin/interpreter-invoices/${result.invoiceId}`);
}

export async function updateInterpreterInvoiceVat(
  invoiceId: string,
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = updateInterpreterInvoiceVatSchema.safeParse({
    vatTreatment: formString(formData, "vatTreatment"),
    vatRate: formString(formData, "vatRate"),
    fiscalNote: formString(formData, "fiscalNote"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const data = parsed.data;

  if (data.vatTreatment === "standard_vat" && !data.vatRate) {
    return { status: "error", message: "Vul het btw-tarief in." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreter_invoices")
    .update({
      vat_treatment_snapshot: data.vatTreatment,
      vat_rate: data.vatTreatment === "standard_vat" ? Number(data.vatRate) : null,
      fiscal_note: data.fiscalNote ?? null,
    })
    .eq("id", invoiceId);

  if (error) {
    return {
      status: "error",
      message:
        error.message === "interpreter_invoice_is_locked"
          ? "Deze afrekening kan niet meer worden bewerkt."
          : "Opslaan is niet gelukt.",
    };
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Btw-gegevens opgeslagen." };
}

export async function addInterpreterInvoiceItem(
  invoiceId: string,
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = interpreterInvoiceItemSchema.safeParse({
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unit: formString(formData, "unit"),
    unitPriceExVatCents: formString(formData, "unitPriceExVat"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("interpreter_invoice_items")
    .select("*", { count: "exact", head: true })
    .eq("interpreter_invoice_id", invoiceId);

  const { error } = await supabase.from("interpreter_invoice_items").insert({
    interpreter_invoice_id: invoiceId,
    sort_order: count ?? 0,
    description: parsed.data.description,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit ?? null,
    unit_price_ex_vat: requiredCentsToNumber(parsed.data.unitPriceExVatCents),
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "interpreter_invoice_items_are_locked"
          ? "Deze afrekening kan niet meer worden bewerkt."
          : "Toevoegen is niet gelukt.",
    };
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Regel toegevoegd." };
}

export async function updateInterpreterInvoiceItem(
  itemId: string,
  invoiceId: string,
  bookingId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = interpreterInvoiceItemSchema.safeParse({
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unit: formString(formData, "unit"),
    unitPriceExVatCents: formString(formData, "unitPriceExVat"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreter_invoice_items")
    .update({
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit ?? null,
      unit_price_ex_vat: requiredCentsToNumber(parsed.data.unitPriceExVatCents),
    })
    .eq("id", itemId);

  if (error) {
    return {
      status: "error",
      message:
        error.message === "interpreter_invoice_items_are_locked"
          ? "Deze afrekening kan niet meer worden bewerkt."
          : "Opslaan is niet gelukt.",
    };
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Regel opgeslagen." };
}

export async function deleteInterpreterInvoiceItem(
  itemId: string,
  invoiceId: string,
  bookingId: string,
) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.from("interpreter_invoice_items").delete().eq("id", itemId);

  if (error) {
    throw new Error(
      error.message === "interpreter_invoice_items_are_locked"
        ? "Deze afrekening kan niet meer worden bewerkt."
        : "Verwijderen is niet gelukt.",
    );
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
}

/** "Naar tolk sturen" - moves draft/change_requested -> pending_review via the validating RPC, then emails the interpreter (A on first send, B on resubmit). */
export async function submitInterpreterSettlementForReview(
  invoiceId: string,
  bookingId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const before = await getInterpreterInvoiceById(supabase, invoiceId);
  const wasChangeRequested = before?.status === "change_requested";

  const { error } = await supabase.rpc("submit_interpreter_settlement_for_review", {
    p_invoice_id: invoiceId,
    p_current_terms_version: CURRENT_SELF_BILLING_TERMS_VERSION,
  });

  if (error) {
    return { status: "error", message: interpreterInvoiceErrorMessage(error.message) };
  }

  const interpreterEmail = before?.interpreter.email;
  if (interpreterEmail && before) {
    const emailDetails = {
      bookingNumber: before.booking.booking_number,
      serviceDateLabel: formatDateLabel(before.booking.requested_date),
      totalIncVatLabel: formatNumberAsCurrency(before.total_inc_vat),
      invoiceId: before.id,
    };
    if (wasChangeRequested) {
      await sendSettlementResubmittedEmail(interpreterEmail, emailDetails);
    } else {
      await sendSettlementReadyForReviewEmail(interpreterEmail, emailDetails);
    }
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Afrekening naar de tolk gestuurd." };
}

/** Admin action mirroring issueInvoiceAction: issue the official number, then generate+store the PDF right away, then email it. */
export async function issueInterpreterInvoiceAction(
  invoiceId: string,
  bookingId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("issue_interpreter_invoice", {
    p_invoice_id: invoiceId,
    p_current_terms_version: CURRENT_SELF_BILLING_TERMS_VERSION,
  });

  if (error) {
    return { status: "error", message: interpreterInvoiceErrorMessage(error.message) };
  }

  const invoice = await getInterpreterInvoiceById(supabase, invoiceId);

  if (invoice) {
    try {
      const pdfBuffer = await getIssuedInterpreterInvoicePdfBuffer(supabase, invoice);
      if (invoice.interpreter.email && invoice.invoice_number) {
        await sendInterpreterInvoiceIssuedEmail({
          to: invoice.interpreter.email,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          totalIncVatLabel: formatNumberAsCurrency(invoice.total_inc_vat),
          pdfBuffer,
        });
      }
    } catch {
      // The invoice is validly issued regardless; the PDF route will retry
      // generating it on next access - see getIssuedInterpreterInvoicePdfBuffer.
    }
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Factuur is definitief gemaakt." };
}

export async function markInterpreterInvoicePaidAction(
  invoiceId: string,
  bookingId: string,
): Promise<FormActionState> {
  const { user } = await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreter_invoices")
    .update({ status: "paid", paid_at: new Date().toISOString(), paid_by: user.id })
    .eq("id", invoiceId);

  if (error) {
    return { status: "error", message: "Markeren als betaald is niet gelukt." };
  }

  const invoice = await getInterpreterInvoiceById(supabase, invoiceId);
  if (invoice?.interpreter.email && invoice.invoice_number) {
    await sendInterpreterInvoicePaidEmail({
      to: invoice.interpreter.email,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
    });
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Gemarkeerd als betaald." };
}

/**
 * Cancel a not-yet-issued settlement. Never allowed once issued/paid - a
 * correction to an issued self-billing invoice is a future credit-note
 * workflow, not implemented in this phase (brief section 17); this action
 * simply refuses that case rather than silently allowing an unsafe edit.
 */
export async function cancelInterpreterInvoiceAction(
  invoiceId: string,
  bookingId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("interpreter_invoices")
    .select("status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (current?.status === "issued" || current?.status === "paid") {
    return {
      status: "error",
      message:
        "Een definitieve of betaalde factuur kan niet worden geannuleerd. Dit vereist een toekomstige credit-nota-workflow.",
    };
  }

  if (current?.status === "cancelled") {
    return { status: "error", message: "Deze afrekening is al geannuleerd." };
  }

  const { error } = await supabase
    .from("interpreter_invoices")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) {
    return { status: "error", message: "Annuleren is niet gelukt." };
  }

  revalidateInterpreterInvoice(invoiceId, bookingId);
  return { status: "success", message: "Afrekening geannuleerd." };
}

/** "Vraag tolk profiel af te ronden" (brief section 3) - sends the existing branded portal reminder email; never fabricates readiness itself. */
export async function requestInterpreterProfileCompletion(interpreterId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("email")
    .eq("id", interpreterId)
    .maybeSingle();

  if (!interpreter?.email) {
    throw new Error("Tolk niet gevonden.");
  }

  const sent = await sendProfileCompletionReminderEmail(interpreter.email);

  if (!sent) {
    throw new Error("Versturen is niet gelukt. Controleer de e-mailconfiguratie.");
  }
}
