import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type MembershipRow = Database["public"]["Tables"]["customer_portal_memberships"]["Row"];

export type CustomerMembership = { membership: MembershipRow; customer: CustomerRow };

export type CustomerAuthState =
  | { status: "unauthenticated" }
  | { status: "unauthorized"; user: User }
  | { status: "authorized"; user: User; memberships: CustomerMembership[]; customer: CustomerRow };

/** CustomerAuthState without "unauthenticated" - mirrors AdminLayoutAuthState/InterpreterLayoutAuthState. */
export type CustomerLayoutAuthState = Exclude<
  CustomerAuthState,
  { status: "unauthenticated" }
>;

/**
 * The authoritative customer-portal check, mirroring lib/auth/interpreter.ts.
 * Always calls auth.getUser() (never getSession()). "Authorized" requires
 * all three of: a real session, profiles.role = 'customer', and at least
 * one active customer_portal_memberships row - the same rule
 * current_customer_ids() enforces at the database level.
 *
 * The membership model deliberately allows one person to belong to more
 * than one organisation in the future (see the migration comment on
 * customer_portal_memberships); today's UI picks the earliest-linked
 * active membership as "the" organisation, which covers every real
 * customer (one person, one company) without blocking that later
 * extension. If that ever needs to change, only this function's "which
 * membership is active" choice needs updating - every query and RPC
 * downstream already works from current_customer_ids()'s full set.
 */
export async function getCustomerAuthState(): Promise<CustomerAuthState> {
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

  if (profile?.role !== "customer") {
    return { status: "unauthorized", user };
  }

  const { data: membershipRows } = await supabase
    .from("customer_portal_memberships")
    .select("*, customer:customers(*)")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const memberships = (membershipRows ?? [])
    .filter(
      (row): row is MembershipRow & { customer: CustomerRow } => row.customer !== null,
    )
    .map((row) => {
      const { customer, ...membership } = row;
      return { membership, customer };
    });

  if (memberships.length === 0) {
    return { status: "unauthorized", user };
  }

  return { status: "authorized", user, memberships, customer: memberships[0].customer };
}

/**
 * For the top of the protected /klant layout. Redirects anonymous visitors
 * to /klant/login. Deliberately does not redirect an authenticated-but-
 * unauthorized user anywhere, avoiding any risk of a redirect loop with the
 * login page (which sends any authenticated session straight to /klant).
 */
export async function requireCustomerLayoutSession(): Promise<CustomerLayoutAuthState> {
  const state = await getCustomerAuthState();

  if (state.status === "unauthenticated") {
    redirect("/klant/login");
  }

  return state;
}

/**
 * For the top of every customer-portal Server Action, independent of the
 * layout render, for the same reason admin/interpreter actions each
 * re-check their own requireXAction() - Server Actions aren't guaranteed to
 * be covered by the proxy matcher.
 */
export async function requireCustomerAction(): Promise<{
  user: User;
  customer: CustomerRow;
}> {
  const state = await getCustomerAuthState();

  if (state.status !== "authorized") {
    throw new Error("Niet geautoriseerd.");
  }

  return { user: state.user, customer: state.customer };
}
