import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type CancellationRequestRow =
  Database["public"]["Tables"]["cancellation_requests"]["Row"];

/** Admin-side: every cancellation/withdrawal request for one booking, newest first. */
export async function listCancellationRequestsForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<CancellationRequestRow[]> {
  const { data, error } = await supabase
    .from("cancellation_requests")
    .select("*")
    .eq("booking_id", bookingId)
    .order("requested_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export type UnavailabilityReportRow =
  Database["public"]["Tables"]["interpreter_unavailability_reports"]["Row"];

export async function listUnavailabilityReportsForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<UnavailabilityReportRow[]> {
  const { data, error } = await supabase
    .from("interpreter_unavailability_reports")
    .select("*")
    .eq("booking_id", bookingId)
    .order("reported_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export type CustomerPortalAttentionCounts = {
  cancellationRequestsPending: number;
  interpreterUnavailableOpen: number;
  awaitingCustomerAcceptance: number;
};

/** Admin dashboard counts for the Phase 4 customer-portal/cancellation workflows (brief section 36). */
export async function getCustomerPortalAttentionCounts(
  supabase: TypedClient,
): Promise<CustomerPortalAttentionCounts> {
  const [cancellationRequestsPending, interpreterUnavailableOpen, awaitingCustomerAcceptance] =
    await Promise.all([
      supabase
        .from("cancellation_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("interpreter_unavailability_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "quoted"),
    ]);

  return {
    cancellationRequestsPending: cancellationRequestsPending.count ?? 0,
    interpreterUnavailableOpen: interpreterUnavailableOpen.count ?? 0,
    awaitingCustomerAcceptance: awaitingCustomerAcceptance.count ?? 0,
  };
}
