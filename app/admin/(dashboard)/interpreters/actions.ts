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
