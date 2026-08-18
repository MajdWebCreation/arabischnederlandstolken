"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterAction } from "@/lib/auth/interpreter";
import { formCheckbox, formString, nullIfBlank } from "@/lib/forms";
import {
  interpreterBusinessDetailsSchema,
  interpreterFiscalDetailsSchema,
  interpreterPaymentDetailsSchema,
} from "@/lib/interpreters/schema";
import { CURRENT_SELF_BILLING_TERMS_VERSION } from "@/lib/legal/terms";
import type { PortalActionState } from "@/components/portal/portal-action-form";

const contactDetailsSchema = z.object({
  phone: z.string().trim().max(40, "Maximaal 40 tekens."),
  city: z.string().trim().max(120, "Maximaal 120 tekens."),
});

/**
 * Only ever touches phone/city - matching what interpreters.active,
 * sworn_interpreter etc. self-edit restrictions allow. The database's own
 * enforce_interpreter_self_edit_columns trigger would reject anything else
 * regardless, but validating the same shape here keeps the error message
 * meaningful instead of a raw database permission error.
 */
export async function updateMyContactDetails(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { interpreter } = await requireInterpreterAction();

  const parsed = contactDetailsSchema.safeParse({
    phone: formString(formData, "phone"),
    city: formString(formData, "city"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreters")
    .update({
      phone: nullIfBlank(parsed.data.phone),
      city: nullIfBlank(parsed.data.city),
    })
    .eq("id", interpreter.id);

  if (error) {
    return { status: "error", message: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/tolk/profiel");
  return { status: "success", message: "Gegevens opgeslagen." };
}

/**
 * Onboarding section C (Zakelijke gegevens). Every field optional at the
 * zod layer - the interpreter saves whatever they have; completeness is
 * evaluated separately by lib/interpreters/completeness.ts, not enforced
 * here as a single all-fields-required submission.
 */
export async function updateMyBusinessDetails(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { interpreter } = await requireInterpreterAction();

  const parsed = interpreterBusinessDetailsSchema.safeParse({
    legalBusinessName: formString(formData, "legalBusinessName"),
    tradeName: formString(formData, "tradeName"),
    businessStreet: formString(formData, "businessStreet"),
    businessHouseNumber: formString(formData, "businessHouseNumber"),
    businessHouseNumberAddition: formString(formData, "businessHouseNumberAddition"),
    businessPostalCode: formString(formData, "businessPostalCode"),
    businessCity: formString(formData, "businessCity"),
    kvkNumber: formString(formData, "kvkNumber"),
    vatId: formString(formData, "vatId"),
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
    .from("interpreters")
    .update({
      legal_business_name: nullIfBlank(data.legalBusinessName),
      trade_name: nullIfBlank(data.tradeName),
      business_street: nullIfBlank(data.businessStreet),
      business_house_number: nullIfBlank(data.businessHouseNumber),
      business_house_number_addition: nullIfBlank(data.businessHouseNumberAddition),
      business_postal_code: nullIfBlank(data.businessPostalCode),
      business_city: nullIfBlank(data.businessCity),
      kvk_number: nullIfBlank(data.kvkNumber),
      vat_id: nullIfBlank(data.vatId),
    })
    .eq("id", interpreter.id);

  if (error) {
    return { status: "error", message: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return { status: "success", message: "Zakelijke gegevens opgeslagen." };
}

/** Onboarding section D (Betaalgegevens). */
export async function updateMyPaymentDetails(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { interpreter } = await requireInterpreterAction();

  const parsed = interpreterPaymentDetailsSchema.safeParse({
    iban: formString(formData, "iban"),
    accountHolderName: formString(formData, "accountHolderName"),
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
    .from("interpreters")
    .update({
      iban: nullIfBlank(data.iban),
      account_holder_name: nullIfBlank(data.accountHolderName),
    })
    .eq("id", interpreter.id);

  if (error) {
    return {
      status: "error",
      message:
        error.message?.includes("interpreters_iban_check")
          ? "Vul een geldig IBAN in."
          : "Bijwerken is niet gelukt.",
    };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return { status: "success", message: "Betaalgegevens opgeslagen." };
}

/** Onboarding section E (Facturatie: btw-status). Self-billing consent itself is a separate action below - never bundled into this save. */
export async function updateMyFiscalDetails(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { interpreter } = await requireInterpreterAction();

  const parsed = interpreterFiscalDetailsSchema.safeParse({
    vatTreatment: formString(formData, "vatTreatment"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreters")
    .update({ vat_treatment: nullIfBlank(parsed.data.vatTreatment) })
    .eq("id", interpreter.id);

  if (error) {
    return { status: "error", message: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return { status: "success", message: "Btw-status opgeslagen." };
}

/**
 * Onboarding section F (Self-billing agreement). The sole write path for
 * self_billing_accepted_at/terms_version/accepted_by - see
 * interpreter_accept_self_billing_agreement() and
 * enforce_interpreter_self_edit_columns() in
 * 20260818121200_interpreter_onboarding_fields.sql for why a direct
 * .update() can never set these three columns, even from this same
 * interpreter's own session. Never silently enabled: requires an explicit
 * checkbox on this exact submission, not implied by saving any other
 * section.
 */
export async function acceptSelfBillingAgreement(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireInterpreterAction();

  if (!formCheckbox(formData, "agree")) {
    return {
      status: "error",
      message: "Vink aan dat u akkoord gaat om self-billing te activeren.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("interpreter_accept_self_billing_agreement", {
    p_terms_version: CURRENT_SELF_BILLING_TERMS_VERSION,
  });

  if (error) {
    return { status: "error", message: "Akkoord vastleggen is niet gelukt. Probeer het opnieuw." };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return { status: "success", message: "Self-billing akkoord vastgelegd." };
}
