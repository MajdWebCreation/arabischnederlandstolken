"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formString, nullIfBlank } from "@/lib/forms";
import { customerSchema } from "@/lib/customers/schema";
import type { FormActionState } from "@/components/admin/admin-action-form";

export async function updateCustomer(
  customerId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = customerSchema.safeParse({
    type: formString(formData, "type"),
    name: formString(formData, "name"),
    organisation: formString(formData, "organisation"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    billingName: formString(formData, "billingName"),
    billingEmail: formString(formData, "billingEmail"),
    billingAddress: formString(formData, "billingAddress"),
    kvkNumber: formString(formData, "kvkNumber"),
    vatNumber: formString(formData, "vatNumber"),
    internalNotes: formString(formData, "internalNotes"),
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
    .from("customers")
    .update({
      type: data.type,
      name: data.name,
      organisation: nullIfBlank(data.organisation),
      email: data.email,
      phone: nullIfBlank(data.phone),
      billing_name: nullIfBlank(data.billingName),
      billing_email: nullIfBlank(data.billingEmail),
      billing_address: nullIfBlank(data.billingAddress),
      kvk_number: nullIfBlank(data.kvkNumber),
      vat_number: nullIfBlank(data.vatNumber),
      internal_notes: nullIfBlank(data.internalNotes),
    })
    .eq("id", customerId);

  if (error) {
    return { status: "error", message: "Klantgegevens bijwerken is niet gelukt." };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/customers");
  return { status: "success", message: "Klantgegevens opgeslagen." };
}
