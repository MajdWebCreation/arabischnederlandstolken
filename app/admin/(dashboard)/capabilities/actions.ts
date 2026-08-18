"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth/admin";
import { formString } from "@/lib/forms";
import type { FormActionState } from "@/components/admin/admin-action-form";
import { z } from "zod";

const createTagSchema = z.object({
  category: z.enum(["dialect", "specialty"], { error: "Kies een categorie." }),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Vul een code in.")
    .max(60, "Maximaal 60 tekens.")
    .regex(/^[a-z0-9_]+$/, "Alleen kleine letters, cijfers en underscores."),
  label: z.string().trim().min(1, "Vul een naam in.").max(120, "Maximaal 120 tekens."),
});

export async function createCapabilityTag(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminAction();

  const parsed = createTagSchema.safeParse({
    category: formString(formData, "category"),
    code: formString(formData, "code"),
    label: formString(formData, "label"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("capability_tags").insert(parsed.data);

  if (error) {
    const message =
      error.code === "23505"
        ? "Deze code bestaat al binnen deze categorie."
        : "Toevoegen is niet gelukt.";
    return { status: "error", message };
  }

  revalidatePath("/admin/capabilities");
  return { status: "success", message: "Toegevoegd." };
}

export async function setCapabilityTagActive(tagId: string, active: boolean) {
  await requireAdminAction();

  const supabase = await createClient();
  const { error } = await supabase
    .from("capability_tags")
    .update({ active })
    .eq("id", tagId);

  if (error) {
    throw new Error("Bijwerken is niet gelukt.");
  }

  revalidatePath("/admin/capabilities");
}
