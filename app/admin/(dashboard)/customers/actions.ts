"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formCheckbox, formString, nullIfBlank } from "@/lib/forms";
import { customerSchema } from "@/lib/customers/schema";
import { customerBookingDefaultsSchema } from "@/lib/customers/schema";
import type { FormActionState } from "@/components/admin/admin-action-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    billingStreet: formString(formData, "billingStreet"),
    billingHouseNumber: formString(formData, "billingHouseNumber"),
    billingHouseNumberAddition: formString(formData, "billingHouseNumberAddition"),
    billingPostalCode: formString(formData, "billingPostalCode"),
    billingCity: formString(formData, "billingCity"),
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
      billing_street: nullIfBlank(data.billingStreet),
      billing_house_number: nullIfBlank(data.billingHouseNumber),
      billing_house_number_addition: nullIfBlank(data.billingHouseNumberAddition),
      billing_postal_code: nullIfBlank(data.billingPostalCode),
      billing_city: nullIfBlank(data.billingCity),
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

/**
 * Links an existing Supabase Auth account (created once via the dashboard -
 * see the final report) to this customer via the
 * admin_link_customer_account RPC - the entire allowlist here, mirroring
 * linkInterpreterAccount. It never creates an auth account and can never
 * grant 'admin'/'interpreter', so this action needs no more authorization
 * logic of its own beyond the standard requireAdminAction() check.
 */
export async function linkCustomerAccount(
  customerId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const email = formString(formData, "email").trim();

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Vul een geldig e-mailadres in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_link_customer_account", {
    p_customer_id: customerId,
    p_email: email,
  });

  if (error) {
    const message =
      error.message === "auth_user_not_found"
        ? "Er bestaat nog geen account met dit e-mailadres. Maak dit eerst aan via Supabase Dashboard > Authentication > Users, en koppel daarna opnieuw."
        : error.message === "target_is_admin"
          ? "Dit account is een beheerdersaccount en kan niet als klant gekoppeld worden."
          : error.message === "target_is_interpreter"
            ? "Dit account is al gekoppeld als tolk en kan niet ook als klant gekoppeld worden."
            : "Koppelen is niet gelukt.";
    return { status: "error", message };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { status: "success", message: `Portaalaccount gekoppeld (${email}).` };
}

export async function unlinkCustomerAccount(customerId: string, membershipId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_unlink_customer_account", {
    p_membership_id: membershipId,
  });

  if (error) {
    throw new Error("Ontkoppelen is niet gelukt.");
  }

  revalidatePath(`/admin/customers/${customerId}`);
}

export async function updateCustomerBookingDefaults(
  customerId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = customerBookingDefaultsSchema.safeParse({
    defaultLanguageFrom: formString(formData, "defaultLanguageFrom"),
    defaultLanguageTo: formString(formData, "defaultLanguageTo"),
    defaultLanguageNotes: formString(formData, "defaultLanguageNotes"),
    defaultContext: formString(formData, "defaultContext"),
    defaultModality: formString(formData, "defaultModality"),
    defaultDurationMinutes: formString(formData, "defaultDurationMinutes"),
    defaultLocationName: formString(formData, "defaultLocationName"),
    defaultLocationAddress: formString(formData, "defaultLocationAddress"),
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
      default_language_from: nullIfBlank(data.defaultLanguageFrom),
      default_language_to: nullIfBlank(data.defaultLanguageTo),
      default_language_notes: nullIfBlank(data.defaultLanguageNotes),
      default_context: nullIfBlank(data.defaultContext),
      default_modality: nullIfBlank(data.defaultModality),
      default_sworn_required: formCheckbox(formData, "defaultSwornRequired"),
      default_duration_minutes: data.defaultDurationMinutes ? Number(data.defaultDurationMinutes) : null,
      default_location_name: nullIfBlank(data.defaultLocationName),
      default_location_address: nullIfBlank(data.defaultLocationAddress),
    })
    .eq("id", customerId);

  if (error) {
    return { status: "error", message: "Standaardwaarden bijwerken is niet gelukt." };
  }

  revalidatePath(`/admin/customers/${customerId}`);
  return { status: "success", message: "Standaardwaarden opgeslagen." };
}
