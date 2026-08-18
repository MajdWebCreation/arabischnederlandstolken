import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  BookingContext,
  BookingModality,
  BookingStatus,
} from "@/lib/bookings/constants";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

export type BookingListFilters = {
  status?: BookingStatus;
  modality?: BookingModality;
  context?: BookingContext;
  interpreterId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

type RawBookingListRow = Database["public"]["Views"]["booking_admin_rows"]["Row"];

// booking_admin_rows joins bookings (inner) with customers (inner) and
// interpreters (left). Every field below traces back through only inner
// joins to a `not null` column on bookings/customers, so it is always
// present whenever a row exists at all - only Postgres's inability to carry
// view-column not-null metadata makes the generated type say otherwise (see
// lib/supabase/invariants.ts). interpreter_first_name/last_name and every
// *_ex_vat/requested_date/requested_start_time/modality field stay nullable
// here: those are either behind the left join or nullable on bookings itself.
export type BookingListRow = Omit<
  RawBookingListRow,
  | "id"
  | "booking_number"
  | "status"
  | "source"
  | "request_type"
  | "context"
  | "language_from"
  | "language_to"
  | "sworn_required"
  | "created_at"
  | "customer_id"
  | "customer_name"
  | "customer_email"
> & {
  id: string;
  booking_number: string;
  status: string;
  source: string;
  request_type: string;
  context: string;
  language_from: string;
  language_to: string;
  sworn_required: boolean;
  created_at: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
};

function toBookingListRow(row: RawBookingListRow): BookingListRow {
  return {
    ...row,
    id: assertNonNull(row.id, "booking_admin_rows.id"),
    booking_number: assertNonNull(row.booking_number, "booking_admin_rows.booking_number"),
    status: assertNonNull(row.status, "booking_admin_rows.status"),
    source: assertNonNull(row.source, "booking_admin_rows.source"),
    request_type: assertNonNull(row.request_type, "booking_admin_rows.request_type"),
    context: assertNonNull(row.context, "booking_admin_rows.context"),
    language_from: assertNonNull(row.language_from, "booking_admin_rows.language_from"),
    language_to: assertNonNull(row.language_to, "booking_admin_rows.language_to"),
    sworn_required: assertNonNull(row.sworn_required, "booking_admin_rows.sworn_required"),
    created_at: assertNonNull(row.created_at, "booking_admin_rows.created_at"),
    customer_id: assertNonNull(row.customer_id, "booking_admin_rows.customer_id"),
    customer_name: assertNonNull(row.customer_name, "booking_admin_rows.customer_name"),
    customer_email: assertNonNull(row.customer_email, "booking_admin_rows.customer_email"),
  };
}

export type BookingListResult = {
  rows: BookingListRow[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 30;

function escapeForIlike(value: string) {
  // PostgREST's or=() syntax treats commas, parentheses, and % specially.
  // Stripping rather than escaping keeps the query valid in all cases and
  // is more than sufficient for a free-text search box.
  return value.replace(/[,()%*]/g, " ").trim();
}

export async function listBookings(
  supabase: TypedClient,
  filters: BookingListFilters,
): Promise<BookingListResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("booking_admin_rows")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.modality) query = query.eq("modality", filters.modality);
  if (filters.context) query = query.eq("context", filters.context);
  if (filters.interpreterId)
    query = query.eq("interpreter_id", filters.interpreterId);
  if (filters.dateFrom) query = query.gte("requested_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("requested_date", filters.dateTo);

  const search = filters.search ? escapeForIlike(filters.search) : "";

  if (search) {
    const pattern = `*${search}*`;
    query = query.or(
      [
        `booking_number.ilike.${pattern}`,
        `customer_name.ilike.${pattern}`,
        `customer_organisation.ilike.${pattern}`,
        `customer_email.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    rows: (data ?? []).map(toBookingListRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export type BookingDetail = Database["public"]["Tables"]["bookings"]["Row"] & {
  customer: Database["public"]["Tables"]["customers"]["Row"];
  interpreter: Database["public"]["Tables"]["interpreters"]["Row"] | null;
};

export async function getBookingById(
  supabase: TypedClient,
  id: string,
): Promise<BookingDetail | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, customer:customers(*), interpreter:interpreters(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BookingDetail | null;
}

export type BookingEventRow =
  Database["public"]["Tables"]["booking_events"]["Row"];

export async function getBookingEvents(
  supabase: TypedClient,
  bookingId: string,
): Promise<BookingEventRow[]> {
  const { data, error } = await supabase
    .from("booking_events")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export type DashboardCounts = {
  newRequests: number;
  interpreterSearch: number;
  upcomingConfirmed: number;
  completed: number;
  completedNotInvoiced: number;
  totalUpcoming: number;
};

function countQuery(supabase: TypedClient) {
  return supabase.from("bookings").select("*", { count: "exact", head: true });
}

async function runCount(
  builder: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  const { count, error } = await builder;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getDashboardCounts(
  supabase: TypedClient,
): Promise<DashboardCounts> {
  const today = new Date().toISOString().slice(0, 10);
  const notYetHappenedStatuses: BookingStatus[] = [
    "new",
    "interpreter_search",
    "quoted",
    "customer_accepted",
    "interpreter_confirmed",
    "confirmed",
  ];

  const [
    newRequests,
    interpreterSearch,
    upcomingConfirmed,
    completed,
    completedNotInvoiced,
    totalUpcoming,
  ] = await Promise.all([
    runCount(countQuery(supabase).eq("status", "new")),
    runCount(countQuery(supabase).eq("status", "interpreter_search")),
    runCount(
      countQuery(supabase)
        .in("status", ["confirmed", "interpreter_confirmed"])
        .or(`requested_date.is.null,requested_date.gte.${today}`),
    ),
    runCount(
      countQuery(supabase).in("status", [
        "completed",
        "customer_invoiced",
        "paid",
      ]),
    ),
    runCount(countQuery(supabase).eq("status", "completed")),
    runCount(
      countQuery(supabase)
        .in("status", notYetHappenedStatuses)
        .or(`requested_date.is.null,requested_date.gte.${today}`),
    ),
  ]);

  return {
    newRequests,
    interpreterSearch,
    upcomingConfirmed,
    completed,
    completedNotInvoiced,
    totalUpcoming,
  };
}

export async function listUpcomingBookings(
  supabase: TypedClient,
  limit = 8,
): Promise<BookingListRow[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("booking_admin_rows")
    .select("*")
    .in("status", ["confirmed", "interpreter_confirmed"])
    .or(`requested_date.is.null,requested_date.gte.${today}`)
    .order("requested_date", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(toBookingListRow);
}
