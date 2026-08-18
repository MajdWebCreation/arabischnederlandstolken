"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formString } from "@/lib/forms";
import type { SignInState } from "@/lib/auth/sign-in-state";

/**
 * Shared by both the admin and interpreter login forms - Supabase Auth
 * itself has no notion of "admin" vs "interpreter" (that is a profiles.role
 * concept checked afterwards, by each portal's own layout), so the sign-in
 * mechanics are identical and only the post-login destination differs.
 * Each login form binds its own `redirectTo` with .bind(), the same
 * pattern used throughout the admin/interpreter Server Actions for
 * per-record ids.
 */
export async function signIn(
  redirectTo: string,
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

  redirect(redirectTo);
}

export async function signOut(redirectTo: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectTo);
}
