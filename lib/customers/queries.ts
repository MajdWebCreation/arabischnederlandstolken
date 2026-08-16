import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

export type CustomerListRow = CustomerRow & {
  booking_count: number;
  latest_booking_date: string | null;
};

function escapeForIlike(value: string) {
  return value.replace(/[,()%*]/g, " ").trim();
}

/**
 * The customer list needs a booking count and latest booking date per
 * customer. Rather than N+1 query every row, this fetches customers plus
 * their bookings' summary fields in one embedded-resource query and
 * reduces client-side - simple and correct at Phase 1's expected data
 * volume.
 */
export async function listCustomers(
  supabase: TypedClient,
  search?: string,
): Promise<CustomerListRow[]> {
  let query = supabase
    .from("customers")
    .select("*, bookings(created_at)")
    .order("created_at", { ascending: false });

  const cleaned = search ? escapeForIlike(search) : "";

  if (cleaned) {
    const pattern = `*${cleaned}*`;
    query = query.or(
      [
        `name.ilike.${pattern}`,
        `organisation.ilike.${pattern}`,
        `email.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const { bookings, ...customer } = row as CustomerRow & {
      bookings: { created_at: string }[];
    };
    const dates = bookings.map((b) => b.created_at).sort();

    return {
      ...customer,
      booking_count: bookings.length,
      latest_booking_date: dates.length ? dates[dates.length - 1] : null,
    };
  });
}

export type CustomerBookingHistoryRow = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  | "id"
  | "booking_number"
  | "status"
  | "requested_date"
  | "context"
  | "language_from"
  | "language_to"
  | "created_at"
>;

export async function getCustomerById(
  supabase: TypedClient,
  id: string,
): Promise<CustomerRow | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCustomerBookingHistory(
  supabase: TypedClient,
  customerId: string,
): Promise<CustomerBookingHistoryRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, status, requested_date, context, language_from, language_to, created_at",
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
