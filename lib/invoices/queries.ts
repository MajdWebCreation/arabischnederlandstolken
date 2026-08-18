import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
export type InvoiceEventRow = Database["public"]["Tables"]["invoice_events"]["Row"];

function escapeForIlike(value: string) {
  return value.replace(/[,()%*]/g, " ").trim();
}

export type InvoiceListFilters = {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InvoiceListRow = InvoiceRow & {
  customer: { id: string; name: string; organisation: string | null } | null;
};

/** Admin-side list for /admin/invoices, with the customer name/organisation embedded for display and search. */
export async function listInvoices(
  supabase: TypedClient,
  filters: InvoiceListFilters,
): Promise<InvoiceListRow[]> {
  let query = supabase
    .from("invoices")
    .select("*, customer:customers(id, name, organisation)")
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as InvoiceListRow[];
  const search = filters.search ? escapeForIlike(filters.search).toLowerCase() : "";

  if (!search) {
    return rows;
  }

  // Filtered client-side rather than via PostgREST `.or()`: the search box
  // matches both the invoice's own number and its embedded customer's
  // name/organisation, and PostgREST's OR-filter syntax doesn't reliably
  // reach into an embedded relationship (see booking_admin_rows for the
  // same reasoning applied to bookings' customer search).
  return rows.filter((row) => {
    const haystack = [
      row.invoice_number,
      row.customer?.name,
      row.customer?.organisation,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export type InvoiceWithDetails = InvoiceRow & {
  items: InvoiceItemRow[];
  customer: Database["public"]["Tables"]["customers"]["Row"];
  booking: Pick<
    Database["public"]["Tables"]["bookings"]["Row"],
    "id" | "booking_number" | "requested_date" | "language_from" | "language_to"
  > | null;
};

export async function getInvoiceById(
  supabase: TypedClient,
  id: string,
): Promise<InvoiceWithDetails | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "*, items:invoice_items(*), customer:customers(*), booking:bookings(id, booking_number, requested_date, language_from, language_to)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "invoice_items", ascending: true })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InvoiceWithDetails | null;
}

export type InvoiceSummaryRow = Pick<
  InvoiceRow,
  | "id"
  | "invoice_number"
  | "status"
  | "invoice_date"
  | "due_date"
  | "total_inc_vat"
  | "created_at"
>;

const summaryColumns =
  "id, invoice_number, status, invoice_date, due_date, total_inc_vat, created_at";

/** Feeds the shared <InvoiceList> component on the customer detail page. */
export async function listInvoicesForCustomer(
  supabase: TypedClient,
  customerId: string,
): Promise<InvoiceSummaryRow[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(summaryColumns)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** Feeds the shared <InvoiceList> component on the booking detail page. */
export async function listInvoicesForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<InvoiceSummaryRow[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(summaryColumns)
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getInvoiceEvents(
  supabase: TypedClient,
  invoiceId: string,
): Promise<InvoiceEventRow[]> {
  const { data, error } = await supabase
    .from("invoice_events")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
