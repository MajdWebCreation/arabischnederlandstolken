import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

export type AssignmentDashboardCounts = {
  openAssignments: number;
  invitationsAwaitingResponse: number;
  interestedAwaitingDecision: number;
};

export async function getAssignmentDashboardCounts(
  supabase: TypedClient,
): Promise<AssignmentDashboardCounts> {
  const [openAssignments, invitationsAwaitingResponse, interestedAwaitingDecision] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("is_open_assignment", true)
        .is("interpreter_id", null),
      supabase
        .from("booking_assignments")
        .select("*", { count: "exact", head: true })
        .in("status", ["invited", "viewed"]),
      supabase
        .from("booking_assignments")
        .select("*", { count: "exact", head: true })
        .eq("status", "interested"),
    ]);

  return {
    openAssignments: openAssignments.count ?? 0,
    invitationsAwaitingResponse: invitationsAwaitingResponse.count ?? 0,
    interestedAwaitingDecision: interestedAwaitingDecision.count ?? 0,
  };
}

export type BookingAssignmentRow =
  Database["public"]["Tables"]["booking_assignments"]["Row"] & {
    interpreter: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      city: string | null;
    } | null;
  };

/** All candidate offers for one booking, admin-side - every status, oldest first. */
export async function listAssignmentsForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<BookingAssignmentRow[]> {
  const { data, error } = await supabase
    .from("booking_assignments")
    .select("*, interpreter:interpreters(id, first_name, last_name, email, city)")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as BookingAssignmentRow[];
}

type RawMyAssignmentOfferRow =
  Database["public"]["Views"]["my_assignment_offers"]["Row"];

// my_assignment_offers inner-joins booking_assignments with bookings (and
// left-joins capability_tags for the optional dialect label). Everything
// below traces through only inner joins to a `not null` column on
// booking_assignments/bookings - including `id`, booking_assignments' own
// primary key, which a mutation (mark-viewed/respond) keys off. Nullable
// fields here are either genuinely optional on the base tables (e.g.
// expires_at, offered_travel_compensation_ex_vat, requested_date) or reach
// this view through the left join (required_dialect_label).
export type MyAssignmentOfferRow = Omit<
  RawMyAssignmentOfferRow,
  | "id"
  | "booking_id"
  | "assignment_type"
  | "status"
  | "offered_compensation_ex_vat"
  | "created_at"
  | "booking_number"
  | "language_from"
  | "language_to"
  | "context"
  | "sworn_required"
> & {
  id: string;
  booking_id: string;
  assignment_type: string;
  status: string;
  offered_compensation_ex_vat: number;
  created_at: string;
  booking_number: string;
  language_from: string;
  language_to: string;
  context: string;
  sworn_required: boolean;
};

function toMyAssignmentOfferRow(row: RawMyAssignmentOfferRow): MyAssignmentOfferRow {
  return {
    ...row,
    id: assertNonNull(row.id, "my_assignment_offers.id"),
    booking_id: assertNonNull(row.booking_id, "my_assignment_offers.booking_id"),
    assignment_type: assertNonNull(row.assignment_type, "my_assignment_offers.assignment_type"),
    status: assertNonNull(row.status, "my_assignment_offers.status"),
    offered_compensation_ex_vat: assertNonNull(
      row.offered_compensation_ex_vat,
      "my_assignment_offers.offered_compensation_ex_vat",
    ),
    created_at: assertNonNull(row.created_at, "my_assignment_offers.created_at"),
    booking_number: assertNonNull(row.booking_number, "my_assignment_offers.booking_number"),
    language_from: assertNonNull(row.language_from, "my_assignment_offers.language_from"),
    language_to: assertNonNull(row.language_to, "my_assignment_offers.language_to"),
    context: assertNonNull(row.context, "my_assignment_offers.context"),
    sworn_required: assertNonNull(row.sworn_required, "my_assignment_offers.sworn_required"),
  };
}

/** The interpreter portal's own offers, from the safe my_assignment_offers view. */
export async function listMyAssignmentOffers(
  supabase: TypedClient,
): Promise<MyAssignmentOfferRow[]> {
  const { data, error } = await supabase
    .from("my_assignment_offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMyAssignmentOfferRow);
}

export async function getMyAssignmentOffer(
  supabase: TypedClient,
  assignmentId: string,
): Promise<MyAssignmentOfferRow | null> {
  const { data, error } = await supabase
    .from("my_assignment_offers")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toMyAssignmentOfferRow(data) : null;
}

type RawMyAssignedBookingRow =
  Database["public"]["Views"]["my_assigned_bookings"]["Row"];

// my_assigned_bookings selects directly from bookings with no join at all,
// filtered to this interpreter's own rows. Every field traced to a `not
// null` bookings column is fixed to non-null below; my_compensation_ex_vat
// and my_travel_compensation_ex_vat stay nullable on purpose - they are
// interpreter_cost_ex_vat/interpreter_travel_cost_ex_vat under the hood,
// and a booking assigned through the pre-Phase-2 quick "direct" dropdown
// (BookingInterpreterForm) sets interpreter_id without ever setting those,
// so a real, still-valid row can legitimately have no compensation on file.
export type MyAssignedBookingRow = Omit<
  RawMyAssignedBookingRow,
  | "booking_id"
  | "booking_number"
  | "status"
  | "language_from"
  | "language_to"
  | "context"
  | "sworn_required"
  | "created_at"
  | "updated_at"
> & {
  booking_id: string;
  booking_number: string;
  status: string;
  language_from: string;
  language_to: string;
  context: string;
  sworn_required: boolean;
  created_at: string;
  updated_at: string;
};

function toMyAssignedBookingRow(row: RawMyAssignedBookingRow): MyAssignedBookingRow {
  return {
    ...row,
    booking_id: assertNonNull(row.booking_id, "my_assigned_bookings.booking_id"),
    booking_number: assertNonNull(row.booking_number, "my_assigned_bookings.booking_number"),
    status: assertNonNull(row.status, "my_assigned_bookings.status"),
    language_from: assertNonNull(row.language_from, "my_assigned_bookings.language_from"),
    language_to: assertNonNull(row.language_to, "my_assigned_bookings.language_to"),
    context: assertNonNull(row.context, "my_assigned_bookings.context"),
    sworn_required: assertNonNull(row.sworn_required, "my_assigned_bookings.sworn_required"),
    created_at: assertNonNull(row.created_at, "my_assigned_bookings.created_at"),
    updated_at: assertNonNull(row.updated_at, "my_assigned_bookings.updated_at"),
  };
}

/** The interpreter portal's own confirmed/completed/cancelled bookings, from the safe my_assigned_bookings view. */
export async function listMyAssignedBookings(
  supabase: TypedClient,
): Promise<MyAssignedBookingRow[]> {
  const { data, error } = await supabase
    .from("my_assigned_bookings")
    .select("*")
    .order("requested_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMyAssignedBookingRow);
}

export async function getMyAssignedBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<MyAssignedBookingRow | null> {
  const { data, error } = await supabase
    .from("my_assigned_bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toMyAssignedBookingRow(data) : null;
}
