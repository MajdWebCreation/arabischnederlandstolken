"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterAction } from "@/lib/auth/interpreter";
import { formString } from "@/lib/forms";
import { requestSettlementChangeSchema } from "@/lib/interpreter-invoices/schema";
import { interpreterInvoiceErrorMessage } from "@/lib/interpreter-invoices/constants";
import type { FormActionState } from "@/components/admin/admin-action-form";

function revalidateSettlement(invoiceId: string) {
  revalidatePath(`/tolk/facturen/${invoiceId}`);
  revalidatePath("/tolk/facturen");
  revalidatePath("/tolk");
}

/**
 * "Akkoord". Calls the SECURITY DEFINER RPC directly - it re-checks
 * ownership (current_interpreter_id()) and status itself, so this action is
 * a thin wrapper, not the authorization boundary.
 */
export async function approveSettlementAction(invoiceId: string): Promise<FormActionState> {
  await requireInterpreterAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("interpreter_approve_settlement", {
    p_invoice_id: invoiceId,
  });

  if (error) {
    return { status: "error", message: interpreterInvoiceErrorMessage(error.message) };
  }

  revalidateSettlement(invoiceId);
  return { status: "success", message: "U bent akkoord gegaan met de afrekening." };
}

/** "Wijziging aanvragen" - a required short message, never a financial amount (the interpreter cannot edit amounts directly). */
export async function requestSettlementChangeAction(
  invoiceId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireInterpreterAction();

  const parsed = requestSettlementChangeSchema.safeParse({
    message: formString(formData, "message"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("interpreter_request_settlement_change", {
    p_invoice_id: invoiceId,
    p_message: parsed.data.message,
  });

  if (error) {
    return { status: "error", message: interpreterInvoiceErrorMessage(error.message) };
  }

  revalidateSettlement(invoiceId);
  return { status: "success", message: "Uw wijzigingsverzoek is verstuurd." };
}
