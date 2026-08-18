"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCustomerAction } from "@/lib/auth/customer";
import { formString, nullIfBlank } from "@/lib/forms";
import { customerPasswordChangeSchema, customerProfileSchema } from "@/lib/customers/portal-schema";
import type { FormActionState } from "@/components/admin/admin-action-form";

/**
 * Only ever writes the safe, customer-editable fields listed in the Phase
 * 4 brief (section 22) - customer type, KVK/VAT, internal notes, pricing,
 * and every admin-managed booking default stay untouched here, and the
 * database's enforce_customer_self_edit_columns() trigger independently
 * rejects any attempt to change anything else regardless of what this
 * action sends.
 */
export async function updateCustomerProfile(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const { customer } = await requireCustomerAction();

  const parsed = customerProfileSchema.safeParse({
    name: formString(formData, "name"),
    phone: formString(formData, "phone"),
    billingName: formString(formData, "billingName"),
    billingEmail: formString(formData, "billingEmail"),
    billingStreet: formString(formData, "billingStreet"),
    billingHouseNumber: formString(formData, "billingHouseNumber"),
    billingHouseNumberAddition: formString(formData, "billingHouseNumberAddition"),
    billingPostalCode: formString(formData, "billingPostalCode"),
    billingCity: formString(formData, "billingCity"),
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
      name: data.name,
      phone: nullIfBlank(data.phone),
      billing_name: nullIfBlank(data.billingName),
      billing_email: nullIfBlank(data.billingEmail),
      billing_street: nullIfBlank(data.billingStreet),
      billing_house_number: nullIfBlank(data.billingHouseNumber),
      billing_house_number_addition: nullIfBlank(data.billingHouseNumberAddition),
      billing_postal_code: nullIfBlank(data.billingPostalCode),
      billing_city: nullIfBlank(data.billingCity),
    })
    .eq("id", customer.id);

  if (error) {
    return { status: "error", message: "Profiel bijwerken is niet gelukt." };
  }

  revalidatePath("/klant/profiel");
  revalidatePath("/klant");
  return { status: "success", message: "Profiel opgeslagen." };
}

/**
 * Changes the password of the currently authenticated portal user only.
 * Uses Supabase Auth's own auth.updateUser() - there is no service role
 * key anywhere in this app, and this call operates strictly on the caller's
 * own cookie-bound session, so there is no code path (here or in Supabase's
 * API itself) through which one customer could change another user's
 * password. Never touches any public table, never logs the password value
 * (the raw strings only ever appear as opaque form values passed straight
 * to Supabase's SDK, never interpolated into a message or error we
 * construct ourselves). Supabase keeps the current session valid after a
 * same-session password update, so no re-login/redirect is needed here.
 */
export async function changeMyPassword(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireCustomerAction();

  const parsed = customerPasswordChangeSchema.safeParse({
    newPassword: formString(formData, "newPassword"),
    confirmPassword: formString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return {
      status: "error",
      message: "Wachtwoord wijzigen is niet gelukt. Probeer het opnieuw.",
    };
  }

  return { status: "success", message: "Uw wachtwoord is gewijzigd." };
}
