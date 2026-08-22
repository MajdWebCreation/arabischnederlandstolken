"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formCheckbox, formString, nullIfBlank } from "@/lib/forms";
import {
  interpreterLanguageSchema,
  interpreterSchema,
} from "@/lib/interpreters/schema";
import type { FormActionState } from "@/components/admin/admin-action-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function interpreterValuesFromForm(formData: FormData) {
  return interpreterSchema.safeParse({
    firstName: formString(formData, "firstName"),
    lastName: formString(formData, "lastName"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    city: formString(formData, "city"),
    rbtvNumber: formString(formData, "rbtvNumber"),
    rbtvExpiryDate: formString(formData, "rbtvExpiryDate"),
    internalNotes: formString(formData, "internalNotes"),
  });
}

export async function createInterpreter(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = interpreterValuesFromForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interpreters")
    .insert({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
      phone: nullIfBlank(parsed.data.phone),
      city: nullIfBlank(parsed.data.city),
      active: formCheckbox(formData, "active"),
      sworn_interpreter: formCheckbox(formData, "swornInterpreter"),
      rbtv_number: nullIfBlank(parsed.data.rbtvNumber),
      rbtv_expiry_date: parsed.data.rbtvExpiryDate || null,
      internal_notes: nullIfBlank(parsed.data.internalNotes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Tolk aanmaken is niet gelukt." };
  }

  revalidatePath("/admin/interpreters");
  redirect(`/admin/interpreters/${data.id}`);
}

export async function updateInterpreter(
  interpreterId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = interpreterValuesFromForm(formData);

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
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
      phone: nullIfBlank(parsed.data.phone),
      city: nullIfBlank(parsed.data.city),
      active: formCheckbox(formData, "active"),
      sworn_interpreter: formCheckbox(formData, "swornInterpreter"),
      rbtv_number: nullIfBlank(parsed.data.rbtvNumber),
      rbtv_expiry_date: parsed.data.rbtvExpiryDate || null,
      internal_notes: nullIfBlank(parsed.data.internalNotes),
    })
    .eq("id", interpreterId);

  if (error) {
    return { status: "error", message: "Tolkgegevens bijwerken is niet gelukt." };
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
  revalidatePath("/admin/interpreters");
  return { status: "success", message: "Tolkgegevens opgeslagen." };
}

export async function setInterpreterActive(
  interpreterId: string,
  active: boolean,
) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreters")
    .update({ active })
    .eq("id", interpreterId);

  if (error) {
    throw new Error("Tolkstatus bijwerken is niet gelukt.");
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
  revalidatePath("/admin/interpreters");
}

export async function addInterpreterLanguage(
  interpreterId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

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
    interpreter_id: interpreterId,
    language_from: parsed.data.languageFrom,
    language_to: parsed.data.languageTo,
    sworn_for_combination: formCheckbox(formData, "swornForCombination"),
    notes: nullIfBlank(parsed.data.notes),
  });

  if (error) {
    const message = error.code === "23505"
      ? "Deze taalcombinatie staat al geregistreerd voor deze tolk."
      : "Taalcombinatie toevoegen is niet gelukt.";
    return { status: "error", message };
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
  return { status: "success", message: "Taalcombinatie toegevoegd." };
}

export async function removeInterpreterLanguage(
  interpreterId: string,
  languageId: string,
) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("interpreter_languages")
    .delete()
    .eq("id", languageId)
    .eq("interpreter_id", interpreterId);

  if (error) {
    throw new Error("Taalcombinatie verwijderen is niet gelukt.");
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
}

/**
 * Links an existing Supabase Auth account (created once via the dashboard -
 * see the final report) to this interpreter and grants the portal role, via
 * the admin_link_interpreter_account RPC. That function is the entire
 * allowlist here: it never creates an auth account and can never grant
 * 'admin', so this action needs no more authorization logic of its own
 * beyond the standard requireAdminAction() check.
 */
export async function linkInterpreterAccount(
  interpreterId: string,
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const email = formString(formData, "email").trim();

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Vul een geldig e-mailadres in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_link_interpreter_account", {
    p_interpreter_id: interpreterId,
    p_email: email,
  });

  if (error) {
    const message =
      error.message === "auth_user_not_found"
        ? "Er bestaat nog geen account met dit e-mailadres. Maak dit eerst aan via Supabase Dashboard > Authentication > Users, en koppel daarna opnieuw."
        : error.message === "already_linked_elsewhere"
          ? "Dit account is al aan een andere tolk gekoppeld."
          : error.message === "target_is_admin"
            ? "Dit account is een beheerdersaccount en kan niet als tolk gekoppeld worden."
            : "Koppelen is niet gelukt.";
    return { status: "error", message };
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
  return { status: "success", message: "Portaalaccount gekoppeld." };
}

export async function unlinkInterpreterAccount(interpreterId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_unlink_interpreter_account", {
    p_interpreter_id: interpreterId,
  });

  if (error) {
    throw new Error("Ontkoppelen is niet gelukt.");
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
}

export async function toggleInterpreterCapability(
  interpreterId: string,
  capabilityTagId: string,
  enabled: boolean,
) {
  await requireAdminAction();

  const supabase = await createClient();

  if (enabled) {
    const { error } = await supabase
      .from("interpreter_capabilities")
      .insert({ interpreter_id: interpreterId, capability_tag_id: capabilityTagId });

    if (error && error.code !== "23505") {
      throw new Error("Bijwerken is niet gelukt.");
    }
  } else {
    const { error } = await supabase
      .from("interpreter_capabilities")
      .delete()
      .eq("interpreter_id", interpreterId)
      .eq("capability_tag_id", capabilityTagId);

    if (error) {
      throw new Error("Bijwerken is niet gelukt.");
    }
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
}

/**
 * "Goedkeuren" - approves the interpreter's *currently* self-claimed sworn/
 * Rbtv credentials as-is, without changing them. "Afwijzen/corrigeren" is
 * deliberately not a separate action: admin corrects the values directly in
 * the ordinary Gegevens form below (updateInterpreter), and
 * enforce_interpreter_self_edit_columns() auto-stamps
 * credentials_verified_at/by whenever an admin edit actually changes
 * sworn_interpreter/rbtv_number/rbtv_expiry_date - see
 * 20260820100000_interpreter_credential_verification.sql. Two review
 * outcomes, one underlying mechanism, no duplicated state.
 */
export async function approveInterpreterCredentials(interpreterId: string) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_interpreter_credentials", {
    p_interpreter_id: interpreterId,
  });

  if (error) {
    throw new Error("Goedkeuren is niet gelukt.");
  }

  revalidatePath(`/admin/interpreters/${interpreterId}`);
}
