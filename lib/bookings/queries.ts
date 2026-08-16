import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  BookingContext,
  BookingModality,
  BookingStatus,
} from "@/lib/bookings/constants";

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

export type BookingListRow =
  Database["public"]["Views"]["booking_admin_rows"]["Row"];

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

  return { rows: data ?? [], total: count ?? 0, page, pageSize };
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

  return data ?? [];
}
