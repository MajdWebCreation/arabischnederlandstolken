import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AdminAuthState =
  | { status: "unauthenticated" }
  | { status: "unauthorized"; user: User }
  | { status: "authorized"; user: User; fullName: string | null };

/** AdminAuthState without "unauthenticated" - what's left after requireAdminLayoutSession redirects that case away. */
export type AdminLayoutAuthState = Exclude<
  AdminAuthState,
  { status: "unauthenticated" }
>;

/**
 * The authoritative admin check. Always calls `auth.getUser()` (never
 * `getSession()`) so the user is re-verified against the Supabase Auth
 * server rather than trusting a possibly-stale cookie, then confirms the
 * profiles.role = 'admin' via a normal RLS-checked query (a signed-in,
 * non-admin user can read their own profile row but nothing else).
 */
export async function getAdminAuthState(): Promise<AdminAuthState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { status: "unauthorized", user };
  }

  return { status: "authorized", user, fullName: profile.full_name };
}

/**
 * For use at the top of the protected dashboard layout. Redirects anonymous
 * visitors to the login page. Deliberately does NOT redirect an
 * authenticated-but-non-admin user anywhere - the caller renders an access
 * denied message instead, which avoids any risk of a redirect loop with the
 * login page (which itself redirects any authenticated session to /admin).
 */
export async function requireAdminLayoutSession(): Promise<AdminLayoutAuthState> {
  const state = await getAdminAuthState();

  if (state.status === "unauthenticated") {
    redirect("/admin/login");
  }

  return state;
}

/**
 * For use at the top of every admin Server Action, independent of the
 * layout render. Server Actions are reachable directly as POST requests and
 * are not guaranteed to be covered by the proxy matcher (see Next.js Proxy
 * docs), so every mutation re-checks authorization itself rather than
 * trusting that the page that rendered the form was properly protected.
 */
export async function requireAdminAction(): Promise<{
  user: User;
  fullName: string | null;
}> {
  const state = await getAdminAuthState();

  if (state.status !== "authorized") {
    throw new Error("Niet geautoriseerd.");
  }

  return { user: state.user, fullName: state.fullName };
}
