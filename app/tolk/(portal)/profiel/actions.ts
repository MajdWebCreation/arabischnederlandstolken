"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterAction } from "@/lib/auth/interpreter";
import { formCheckbox, formString, nullIfBlank } from "@/lib/forms";
import {
  interpreterBusinessDetailsSchema,
  interpreterCredentialsSchema,
  interpreterFiscalDetailsSchema,
  interpreterLanguageSchema,
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

/**
 * Section 9 of the assignment/settlement-tightening brief: an interpreter
 * may now self-edit sworn status/Rbtv details, but never as a silently-
 * trusted change - interpreter_update_credentials() (the sole write path,
 * see 20260820100000_interpreter_credential_verification.sql) always
 * clears credentials_verified_at/by, so the claim shows as "Te controleren"
 * until admin reviews it. Never blocks saving the interpreter's own claim.
 */
export async function updateMyCredentials(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  await requireInterpreterAction();

  const parsed = interpreterCredentialsSchema.safeParse({
    rbtvNumber: formString(formData, "rbtvNumber"),
    rbtvExpiryDate: formString(formData, "rbtvExpiryDate"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("interpreter_update_credentials", {
    p_sworn_interpreter: formCheckbox(formData, "swornInterpreter"),
    p_rbtv_number: parsed.data.rbtvNumber,
    p_rbtv_expiry_date: parsed.data.rbtvExpiryDate,
  });

  if (error) {
    return { status: "error", message: "Bijwerken is niet gelukt." };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return {
    status: "success",
    message: "Tolkgegevens opgeslagen. Een beheerder controleert deze wijziging.",
  };
}

/** Interpreters can now fully manage their own language combinations - see the RLS policies added alongside interpreter_update_credentials(). A newly self-claimed sworn combination is flagged for review by a database trigger, not here. */
export async function addMyLanguage(
  _previousState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const { interpreter } = await requireInterpreterAction();

  const parsed = interpreterLanguageSchema.safeParse({
    languageFrom: formString(formData, "languageFrom"),
    languageTo: formString(formData, "languageTo"),
    notes: formString(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de taalcombinatie.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("interpreter_languages").insert({
    interpreter_id: interpreter.id,
    language_from: parsed.data.languageFrom,
    language_to: parsed.data.languageTo,
    sworn_for_combination: formCheckbox(formData, "swornForCombination"),
    notes: nullIfBlank(parsed.data.notes),
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "Deze taalcombinatie staat al geregistreerd."
        : "Taalcombinatie toevoegen is niet gelukt.";
    return { status: "error", message };
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
  return { status: "success", message: "Taalcombinatie toegevoegd." };
}

export async function removeMyLanguage(languageId: string) {
  const { interpreter } = await requireInterpreterAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreter_languages")
    .delete()
    .eq("id", languageId)
    .eq("interpreter_id", interpreter.id);

  if (error) {
    throw new Error("Taalcombinatie verwijderen is niet gelukt.");
  }

  revalidatePath("/tolk/profiel");
  revalidatePath("/tolk");
}

/** Dialects/specialisations are outside the verification model (brief section 9's list of sensitive fields does not include them) - freely self-managed, mirroring the admin toggle exactly. */
export async function toggleMyCapability(capabilityTagId: string, enabled: boolean) {
  const { interpreter } = await requireInterpreterAction();

  const supabase = await createClient();

  if (enabled) {
    const { error } = await supabase
      .from("interpreter_capabilities")
      .insert({ interpreter_id: interpreter.id, capability_tag_id: capabilityTagId });

    if (error && error.code !== "23505") {
      throw new Error("Bijwerken is niet gelukt.");
    }
  } else {
    const { error } = await supabase
      .from("interpreter_capabilities")
      .delete()
      .eq("interpreter_id", interpreter.id)
      .eq("capability_tag_id", capabilityTagId);

    if (error) {
      throw new Error("Bijwerken is niet gelukt.");
    }
  }

  revalidatePath("/tolk/profiel");
}
