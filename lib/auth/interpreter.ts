import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { InterpreterRow } from "@/lib/interpreters/queries";

export type InterpreterAuthState =
  | { status: "unauthenticated" }
  | { status: "unauthorized"; user: User }
  | { status: "authorized"; user: User; interpreter: InterpreterRow };

/** InterpreterAuthState without "unauthenticated" - mirrors AdminLayoutAuthState. */
export type InterpreterLayoutAuthState = Exclude<
  InterpreterAuthState,
  { status: "unauthenticated" }
>;

/**
 * The authoritative interpreter-portal check, mirroring lib/auth/admin.ts.
 * Always calls auth.getUser() (never getSession()). "Authorized" requires
 * all three of: a real session, profiles.role = 'interpreter', and an
 * active interpreter record linked via user_id - the same rule
 * current_interpreter_id() enforces at the database level, checked again
 * here so the portal UI can render something more specific than an empty
 * dataset when access is denied.
 */
export async function getInterpreterAuthState(): Promise<InterpreterAuthState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "interpreter") {
    return { status: "unauthorized", user };
  }

  const { data: interpreter } = await supabase
    .from("interpreters")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!interpreter) {
    return { status: "unauthorized", user };
  }

  return { status: "authorized", user, interpreter };
}

/**
 * For the top of the protected /tolk layout. Redirects anonymous visitors
 * to /tolk/login. Deliberately does not redirect an authenticated-but-
 * unauthorized user anywhere, avoiding any risk of a redirect loop with the
 * login page (which sends any authenticated session straight to /tolk).
 */
export async function requireInterpreterLayoutSession(): Promise<InterpreterLayoutAuthState> {
  const state = await getInterpreterAuthState();

  if (state.status === "unauthenticated") {
    redirect("/tolk/login");
  }

  return state;
}

/**
 * For the top of every interpreter Server Action, independent of the
 * layout render, for the same reason admin actions each re-check
 * requireAdminAction() - Server Actions aren't guaranteed to be covered by
 * the proxy matcher.
 */
export async function requireInterpreterAction(): Promise<{
  user: User;
  interpreter: InterpreterRow;
}> {
  const state = await getInterpreterAuthState();

  if (state.status !== "authorized") {
    throw new Error("Niet geautoriseerd.");
  }

  return { user: state.user, interpreter: state.interpreter };
}
