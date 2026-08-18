"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireInterpreterAction } from "@/lib/auth/interpreter";
import { formString, nullIfBlank } from "@/lib/forms";
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
