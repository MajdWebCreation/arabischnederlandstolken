import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { assertNonNull } from "@/lib/supabase/invariants";

type TypedClient = SupabaseClient<Database>;

type RawMyCustomerBookingRow = Database["public"]["Views"]["my_customer_bookings"]["Row"];

// my_customer_bookings selects directly from bookings (no join required for
// the base columns) filtered to the caller's own organisation, left-joined
// with interpreters only for the interpreter_* columns. Every field traced
// to a `not null` bookings column is fixed to non-null below - see
// lib/supabase/invariants.ts for why this is safe despite Postgres marking
// every view column nullable.
export type MyCustomerBookingRow = Omit<
  RawMyCustomerBookingRow,
  | "booking_id"
  | "booking_number"
  | "status"
  | "context"
  | "language_from"
  | "language_to"
  | "sworn_required"
  | "vat_rate"
  | "created_at"
  | "updated_at"
  | "customer_id"
> & {
  booking_id: string;
  booking_number: string;
  status: string;
  context: string;
  language_from: string;
  language_to: string;
  sworn_required: boolean;
  vat_rate: number;
  created_at: string;
  updated_at: string;
  customer_id: string;
};

function toMyCustomerBookingRow(row: RawMyCustomerBookingRow): MyCustomerBookingRow {
  return {
    ...row,
    booking_id: assertNonNull(row.booking_id, "my_customer_bookings.booking_id"),
    booking_number: assertNonNull(row.booking_number, "my_customer_bookings.booking_number"),
    status: assertNonNull(row.status, "my_customer_bookings.status"),
    context: assertNonNull(row.context, "my_customer_bookings.context"),
    language_from: assertNonNull(row.language_from, "my_customer_bookings.language_from"),
    language_to: assertNonNull(row.language_to, "my_customer_bookings.language_to"),
    sworn_required: assertNonNull(row.sworn_required, "my_customer_bookings.sworn_required"),
    vat_rate: assertNonNull(row.vat_rate, "my_customer_bookings.vat_rate"),
    created_at: assertNonNull(row.created_at, "my_customer_bookings.created_at"),
    updated_at: assertNonNull(row.updated_at, "my_customer_bookings.updated_at"),
    customer_id: assertNonNull(row.customer_id, "my_customer_bookings.customer_id"),
  };
}

/** All of the caller's own organisation's bookings (every customer_id in current_customer_ids()), newest request first. */
export async function listMyCustomerBookings(
  supabase: TypedClient,
): Promise<MyCustomerBookingRow[]> {
  const { data, error } = await supabase
    .from("my_customer_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMyCustomerBookingRow);
}

export async function getMyCustomerBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<MyCustomerBookingRow | null> {
  const { data, error } = await supabase
    .from("my_customer_bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toMyCustomerBookingRow(data) : null;
}

export type MyCustomerInvoiceRow =
  Database["public"]["Views"]["my_customer_invoices"]["Row"];

export async function listMyCustomerInvoices(
  supabase: TypedClient,
): Promise<MyCustomerInvoiceRow[]> {
  const { data, error } = await supabase
    .from("my_customer_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/** Read-only, customer-safe invoice list for one booking (Phase 4 brief section 34) - reuses the existing invoice security model via my_customer_invoices rather than a new one. */
export async function listMyCustomerInvoicesForBooking(
  supabase: TypedClient,
  bookingId: string,
): Promise<MyCustomerInvoiceRow[]> {
  const { data, error } = await supabase
    .from("my_customer_invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * The one authorized path to "where is the stored PDF for one of my own
 * invoices" - see get_my_issued_invoice_pdf_path() in
 * 20260818120900_customer_invoice_pdf_access.sql. Returns null for
 * anything not found/not theirs/still a draft (never distinguishable),
 * and separately null for pdf_storage_path when the invoice is real and
 * theirs but genuinely has no stored document yet - callers must not
 * regenerate one in that case, only report "not yet available".
 */
export async function getMyIssuedInvoicePdfPath(
  supabase: TypedClient,
  invoiceId: string,
): Promise<{ pdfStoragePath: string | null; invoiceNumber: string } | null> {
  const { data, error } = await supabase.rpc("get_my_issued_invoice_pdf_path", {
    p_invoice_id: invoiceId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];
  return { pdfStoragePath: row.pdf_storage_path, invoiceNumber: row.invoice_number };
}

export type CancellationRequestRow =
  Database["public"]["Tables"]["cancellation_requests"]["Row"];

/** The caller's own booking's cancellation/withdrawal requests, via the RLS policy scoping cancellation_requests to the caller's own bookings. */
export async function listCancellationRequestsForMyBooking(
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

/** Admin-side: every membership (active or not) for one customer, for the "Klantportaal" section of /admin/customers/[id]. */
export type CustomerPortalMembershipRow =
  Database["public"]["Tables"]["customer_portal_memberships"]["Row"];

export async function listCustomerPortalMemberships(
  supabase: TypedClient,
  customerId: string,
): Promise<CustomerPortalMembershipRow[]> {
  const { data, error } = await supabase
    .from("customer_portal_memberships")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
