"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formString } from "@/lib/forms";
import { updateInvoiceHeaderSchema, invoiceItemSchema } from "@/lib/invoices/schema";
import { getInvoiceById } from "@/lib/invoices/queries";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import { getIssuedInvoicePdfBuffer } from "@/lib/invoices/pdf-storage";
import { sendInvoiceEmail } from "@/lib/invoices/notifications";
import { requiredCentsToNumber, formatNumberAsCurrency } from "@/lib/money";
import type { FormActionState } from "@/components/admin/admin-action-form";

// invoice_created/issued/sent/marked_paid/payment_reverted/cancelled are
// all logged automatically by log_invoice_changes_trigger - these actions
// only ever need to make the underlying invoices/invoice_items change.
function revalidateInvoice(invoiceId: string) {
  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
}

const ISSUE_ERROR_MESSAGES: Record<string, string> = {
  missing_billing_address: "Factuuradres ontbreekt bij de klant.",
  invoice_has_no_items: "Voeg eerst minstens één factuurregel toe.",
  invoice_not_draft: "Deze factuur is al definitief gemaakt.",
  invoice_not_found: "Factuur niet gevonden.",
  business_settings_missing: "Bedrijfsgegevens ontbreken.",
  not_authorized: "Niet geautoriseerd.",
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL");
}

export async function updateInvoiceHeader(
  invoiceId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = updateInvoiceHeaderSchema.safeParse({
    invoiceDate: formString(formData, "invoiceDate"),
    dueDate: formString(formData, "dueDate"),
    paymentTermDays: formString(formData, "paymentTermDays"),
    customerNote: formString(formData, "customerNote"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({
      invoice_date: parsed.data.invoiceDate ?? null,
      due_date: parsed.data.dueDate ?? null,
      payment_term_days: parsed.data.paymentTermDays,
      customer_note: parsed.data.customerNote ?? null,
    })
    .eq("id", invoiceId);

  if (error) {
    return {
      status: "error",
      message:
        error.message === "issued_invoice_is_immutable"
          ? "Deze factuur is al definitief en kan niet meer worden bewerkt."
          : "Opslaan is niet gelukt.",
    };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Factuurgegevens opgeslagen." };
}

export async function addInvoiceItem(
  invoiceId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = invoiceItemSchema.safeParse({
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unitPriceExVatCents: formString(formData, "unitPriceExVat"),
    vatRate: formString(formData, "vatRate"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("invoice_items")
    .select("*", { count: "exact", head: true })
    .eq("invoice_id", invoiceId);

  const { error } = await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    position: count ?? 0,
    description: parsed.data.description,
    quantity: parsed.data.quantity,
    unit_price_ex_vat: requiredCentsToNumber(parsed.data.unitPriceExVatCents),
    vat_rate: parsed.data.vatRate,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "issued_invoice_items_are_immutable"
          ? "Deze factuur is al definitief; regels kunnen niet meer worden gewijzigd."
          : "Toevoegen is niet gelukt.",
    };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Regel toegevoegd." };
}

export async function updateInvoiceItem(
  itemId: string,
  invoiceId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = invoiceItemSchema.safeParse({
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unitPriceExVatCents: formString(formData, "unitPriceExVat"),
    vatRate: formString(formData, "vatRate"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoice_items")
    .update({
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unit_price_ex_vat: requiredCentsToNumber(parsed.data.unitPriceExVatCents),
      vat_rate: parsed.data.vatRate,
    })
    .eq("id", itemId);

  if (error) {
    return {
      status: "error",
      message:
        error.message === "issued_invoice_items_are_immutable"
          ? "Deze factuur is al definitief; regels kunnen niet meer worden gewijzigd."
          : "Opslaan is niet gelukt.",
    };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Regel opgeslagen." };
}

export async function deleteInvoiceItem(itemId: string, invoiceId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.from("invoice_items").delete().eq("id", itemId);

  if (error) {
    throw new Error(
      error.message === "issued_invoice_items_are_immutable"
        ? "Deze factuur is al definitief; regels kunnen niet meer worden verwijderd."
        : "Verwijderen is niet gelukt.",
    );
  }

  revalidateInvoice(invoiceId);
}

export async function issueInvoiceAction(
  invoiceId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("issue_invoice", { p_invoice_id: invoiceId });

  if (error) {
    return {
      status: "error",
      message: ISSUE_ERROR_MESSAGES[error.message] ?? "Definitief maken is niet gelukt.",
    };
  }

  // Generate and store the PDF right away, so the issued invoice has its
  // historical document from the moment it exists - see
  // getIssuedInvoicePdfBuffer for why this is safe to call again later too.
  const [invoice, businessSettings] = await Promise.all([
    getInvoiceById(supabase, invoiceId),
    getBusinessSettings(supabase),
  ]);

  if (invoice) {
    try {
      await getIssuedInvoicePdfBuffer(supabase, invoice, businessSettings);
    } catch {
      // The invoice is validly issued regardless; the PDF route/send action
      // will retry generating it on next access. Not surfaced as an error
      // here so a transient Storage hiccup doesn't look like issuing itself
      // failed.
    }
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Factuur is definitief gemaakt." };
}

export async function sendInvoiceAction(
  invoiceId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const [invoice, businessSettings] = await Promise.all([
    getInvoiceById(supabase, invoiceId),
    getBusinessSettings(supabase),
  ]);

  if (!invoice) {
    return { status: "error", message: "Factuur niet gevonden." };
  }

  if (invoice.status === "draft" || invoice.status === "cancelled") {
    return { status: "error", message: "Deze factuur kan niet worden verzonden." };
  }

  const destinationEmail =
    invoice.customer.billing_email?.trim() || invoice.customer.email;

  const pdfBuffer = await getIssuedInvoicePdfBuffer(supabase, invoice, businessSettings);

  const sent = await sendInvoiceEmail({
    to: destinationEmail,
    invoiceNumber: invoice.invoice_number ?? "-",
    totalIncVatLabel: formatNumberAsCurrency(invoice.total_inc_vat),
    dueDateLabel: formatDateLabel(invoice.due_date),
    companyName: businessSettings.company_name,
    pdfBuffer,
  });

  if (!sent) {
    return {
      status: "error",
      message:
        "Verzenden is niet gelukt. Controleer de e-mailconfiguratie en probeer het opnieuw.",
    };
  }

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_to_email: destinationEmail,
    })
    .eq("id", invoiceId);

  if (error) {
    return {
      status: "error",
      message:
        "De e-mail is verzonden, maar de status kon niet worden bijgewerkt. Ververs de pagina.",
    };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: `Factuur verzonden naar ${destinationEmail}.` };
}

export async function markInvoicePaidAction(
  invoiceId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) {
    return { status: "error", message: "Markeren als betaald is niet gelukt." };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Factuur gemarkeerd als betaald." };
}

export async function revertInvoicePaymentAction(
  invoiceId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("invoices")
    .select("sent_at")
    .eq("id", invoiceId)
    .maybeSingle();

  const revertStatus = current?.sent_at ? "sent" : "issued";

  const { error } = await supabase
    .from("invoices")
    .update({ status: revertStatus, paid_at: null })
    .eq("id", invoiceId);

  if (error) {
    return { status: "error", message: "Ongedaan maken is niet gelukt." };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Betaalmarkering ongedaan gemaakt." };
}

export async function cancelInvoiceAction(
  invoiceId: string,
): Promise<FormActionState> {
  await requireAdminAction();

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (current?.status === "paid") {
    return { status: "error", message: "Een betaalde factuur kan niet worden geannuleerd." };
  }

  if (current?.status === "cancelled") {
    return { status: "error", message: "Deze factuur is al geannuleerd." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) {
    return { status: "error", message: "Annuleren is niet gelukt." };
  }

  revalidateInvoice(invoiceId);
  return { status: "success", message: "Factuur geannuleerd." };
}
