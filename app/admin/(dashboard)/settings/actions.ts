"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formString } from "@/lib/forms";
import { businessSettingsSchema } from "@/lib/business-settings/schema";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import type { FormActionState } from "@/components/admin/admin-action-form";

export async function updateBusinessSettings(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = businessSettingsSchema.safeParse({
    companyName: formString(formData, "companyName"),
    addressLine: formString(formData, "addressLine"),
    postalCode: formString(formData, "postalCode"),
    city: formString(formData, "city"),
    country: formString(formData, "country"),
    kvkNumber: formString(formData, "kvkNumber"),
    vatId: formString(formData, "vatId"),
    iban: formString(formData, "iban"),
    website: formString(formData, "website"),
    email: formString(formData, "email"),
    invoicePrefix: formString(formData, "invoicePrefix"),
    paymentTermDays: formString(formData, "paymentTermDays"),
    footerText: formString(formData, "footerText"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const current = await getBusinessSettings(supabase);

  const { error } = await supabase
    .from("business_settings")
    .update({
      company_name: parsed.data.companyName,
      address_line: parsed.data.addressLine,
      postal_code: parsed.data.postalCode,
      city: parsed.data.city,
      country: parsed.data.country,
      kvk_number: parsed.data.kvkNumber,
      vat_id: parsed.data.vatId,
      iban: parsed.data.iban,
      website: parsed.data.website,
      email: parsed.data.email ?? null,
      invoice_prefix: parsed.data.invoicePrefix,
      payment_term_days: parsed.data.paymentTermDays,
      footer_text: parsed.data.footerText ?? null,
    })
    .eq("id", current.id);

  if (error) {
    return { status: "error", message: "Opslaan is niet gelukt." };
  }

  revalidatePath("/admin/settings");
  return {
    status: "success",
    message:
      "Bedrijfsgegevens opgeslagen. Al uitgegeven facturen blijven ongewijzigd.",
  };
}
