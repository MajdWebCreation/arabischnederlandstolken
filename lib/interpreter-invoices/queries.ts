import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

export type InterpreterInvoiceRow = Database["public"]["Tables"]["interpreter_invoices"]["Row"];
export type InterpreterInvoiceItemRow =
  Database["public"]["Tables"]["interpreter_invoice_items"]["Row"];
export type InterpreterInvoiceEventRow =
  Database["public"]["Tables"]["interpreter_invoice_events"]["Row"];

function escapeForIlike(value: string) {
  return value.replace(/[,()%*]/g, " ").trim();
}

export type InterpreterInvoiceListFilters = {
  status?: string;
  search?: string;
};

export type InterpreterInvoiceListRow = InterpreterInvoiceRow & {
  interpreter: { id: string; first_name: string; last_name: string } | null;
  booking: { id: string; booking_number: string; requested_date: string | null } | null;
};

/** Admin-side list for /admin/interpreter-invoices, with the interpreter/booking embedded for display and search. */
export async function listInterpreterInvoices(
  supabase: TypedClient,
  filters: InterpreterInvoiceListFilters,
): Promise<InterpreterInvoiceListRow[]> {
  let query = supabase
    .from("interpreter_invoices")
    .select(
      "*, interpreter:interpreters(id, first_name, last_name), booking:bookings(id, booking_number, requested_date)",
    )
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as InterpreterInvoiceListRow[];
  const search = filters.search ? escapeForIlike(filters.search).toLowerCase() : "";

  if (!search) {
    return rows;
  }

  return rows.filter((row) => {
    const haystack = [
      row.invoice_number,
      row.booking?.booking_number,
      row.interpreter ? `${row.interpreter.first_name} ${row.interpreter.last_name}` : null,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export type InterpreterInvoiceWithDetails = InterpreterInvoiceRow & {
  items: InterpreterInvoiceItemRow[];
  interpreter: Database["public"]["Tables"]["interpreters"]["Row"];
  booking: Pick<
    Database["public"]["Tables"]["bookings"]["Row"],
    | "id"
    | "booking_number"
    | "requested_date"
    | "modality"
    | "language_from"
    | "language_to"
    | "actual_duration_minutes"
    | "expected_duration_minutes"
    | "interpreter_cost_ex_vat"
    | "interpreter_travel_cost_ex_vat"
    | "status"
  >;
};

export async function getInterpreterInvoiceById(
  supabase: TypedClient,
  id: string,
): Promise<InterpreterInvoiceWithDetails | null> {
  const { data, error } = await supabase
    .from("interpreter_invoices")
    .select(
      "*, items:interpreter_invoice_items(*), interpreter:interpreters(*), booking:bookings(id, booking_number, requested_date, modality, language_from, language_to, actual_duration_minutes, expected_duration_minutes, interpreter_cost_ex_vat, interpreter_travel_cost_ex_vat, status)",
    )
    .eq("id", id)
    .order("sort_order", { referencedTable: "interpreter_invoice_items", ascending: true })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InterpreterInvoiceWithDetails | null;
}

export async function getInterpreterInvoiceEvents(
  supabase: TypedClient,
  invoiceId: string,
): Promise<InterpreterInvoiceEventRow[]> {
  const { data, error } = await supabase
    .from("interpreter_invoice_events")
    .select("*")
    .eq("interpreter_invoice_id", invoiceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export type InterpreterInvoiceSummaryRow = Pick<
  InterpreterInvoiceRow,
  "id" | "invoice_number" | "status" | "total_inc_vat" | "issued_at" | "paid_at" | "created_at"
>;

const summaryColumns = "id, invoice_number, status, total_inc_vat, issued_at, paid_at, created_at";

/** Feeds the "recent self-billing invoices" section on the interpreter detail page. */
export async function listInterpreterInvoicesForInterpreter(
  supabase: TypedClient,
  interpreterId: string,
): Promise<InterpreterInvoiceSummaryRow[]> {
  const { data, error } = await supabase
    .from("interpreter_invoices")
    .select(summaryColumns)
    .eq("interpreter_id", interpreterId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** Feeds the "Tolkafrekening" section on the booking detail page - at most one active (non-cancelled) row, per the one-settlement-per-booking design. */
export async function getInterpreterInvoiceForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<InterpreterInvoiceRow | null> {
  const { data, error } = await supabase
    .from("interpreter_invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// --- Interpreter portal (/tolk/facturen) ---

type RawMyInterpreterInvoiceRow = Database["public"]["Views"]["my_interpreter_invoices"]["Row"];

/**
 * my_interpreter_invoices inner-joins interpreter_invoices with bookings,
 * filtered to this interpreter's own non-draft rows - every field traced to
 * a `not null` column on either base table is fixed to non-null below.
 * booking_snapshot/fiscal_note/vat_rate/vat_treatment_snapshot/
 * last_change_request_message/issued_at/paid_at stay nullable - all
 * genuinely optional depending on the settlement's current status.
 */
export type MyInterpreterInvoiceRow = Omit<
  RawMyInterpreterInvoiceRow,
  | "id"
  | "status"
  | "currency"
  | "subtotal_ex_vat"
  | "vat_amount"
  | "total_inc_vat"
  | "booking_id"
  | "created_at"
  | "booking_number"
  | "language_from"
  | "language_to"
> & {
  id: string;
  status: string;
  currency: string;
  subtotal_ex_vat: number;
  vat_amount: number;
  total_inc_vat: number;
  booking_id: string;
  created_at: string;
  booking_number: string;
  language_from: string;
  language_to: string;
};

function toMyInterpreterInvoiceRow(row: RawMyInterpreterInvoiceRow): MyInterpreterInvoiceRow {
  return {
    ...row,
    id: assertNonNull(row.id, "my_interpreter_invoices.id"),
    status: assertNonNull(row.status, "my_interpreter_invoices.status"),
    currency: assertNonNull(row.currency, "my_interpreter_invoices.currency"),
    subtotal_ex_vat: assertNonNull(row.subtotal_ex_vat, "my_interpreter_invoices.subtotal_ex_vat"),
    vat_amount: assertNonNull(row.vat_amount, "my_interpreter_invoices.vat_amount"),
    total_inc_vat: assertNonNull(row.total_inc_vat, "my_interpreter_invoices.total_inc_vat"),
    booking_id: assertNonNull(row.booking_id, "my_interpreter_invoices.booking_id"),
    created_at: assertNonNull(row.created_at, "my_interpreter_invoices.created_at"),
    booking_number: assertNonNull(row.booking_number, "my_interpreter_invoices.booking_number"),
    language_from: assertNonNull(row.language_from, "my_interpreter_invoices.language_from"),
    language_to: assertNonNull(row.language_to, "my_interpreter_invoices.language_to"),
  };
}

export async function listMyInterpreterInvoices(
  supabase: TypedClient,
): Promise<MyInterpreterInvoiceRow[]> {
  const { data, error } = await supabase
    .from("my_interpreter_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMyInterpreterInvoiceRow);
}

export async function getMyInterpreterInvoice(
  supabase: TypedClient,
  id: string,
): Promise<MyInterpreterInvoiceRow | null> {
  const { data, error } = await supabase
    .from("my_interpreter_invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toMyInterpreterInvoiceRow(data) : null;
}

export type MyInterpreterInvoiceItemRow = InterpreterInvoiceItemRow;

export async function listMyInterpreterInvoiceItems(
  supabase: TypedClient,
  invoiceId: string,
): Promise<MyInterpreterInvoiceItemRow[]> {
  const { data, error } = await supabase
    .from("interpreter_invoice_items")
    .select("*")
    .eq("interpreter_invoice_id", invoiceId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export type InterpreterInvoiceDashboardCounts = {
  pendingReview: number;
  outstanding: number;
  paid: number;
};

/** Feeds the compact financial card on the /tolk dashboard. "Openstaand" = approved or issued but not yet paid. */
export async function getMyInterpreterInvoiceDashboardCounts(
  supabase: TypedClient,
): Promise<InterpreterInvoiceDashboardCounts> {
  const [pendingReview, outstanding, paid] = await Promise.all([
    supabase
      .from("my_interpreter_invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("my_interpreter_invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["approved", "issued"]),
    supabase
      .from("my_interpreter_invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
  ]);

  return {
    pendingReview: pendingReview.count ?? 0,
    outstanding: outstanding.count ?? 0,
    paid: paid.count ?? 0,
  };
}
