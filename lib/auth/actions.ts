"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formString } from "@/lib/forms";
import type { SignInState } from "@/lib/auth/sign-in-state";

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");

  if (!email || !password) {
    return {
      status: "error",
      message: "Vul een e-mailadres en wachtwoord in.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: "Onjuiste inloggegevens. Controleer e-mailadres en wachtwoord.",
    };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
