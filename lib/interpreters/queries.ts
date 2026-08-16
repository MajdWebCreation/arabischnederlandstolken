import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type InterpreterRow = Database["public"]["Tables"]["interpreters"]["Row"];
export type InterpreterLanguageRow =
  Database["public"]["Tables"]["interpreter_languages"]["Row"];

export type InterpreterListRow = InterpreterRow & {
  interpreter_languages: InterpreterLanguageRow[];
};

export type InterpreterListFilters = {
  search?: string;
  activeOnly?: boolean;
};

function escapeForIlike(value: string) {
  return value.replace(/[,()%*]/g, " ").trim();
}

export async function listInterpreters(
  supabase: TypedClient,
  filters: InterpreterListFilters = {},
): Promise<InterpreterListRow[]> {
  let query = supabase
    .from("interpreters")
    .select("*, interpreter_languages(*)")
    .order("last_name", { ascending: true });

  if (filters.activeOnly) {
    query = query.eq("active", true);
  }

  const search = filters.search ? escapeForIlike(filters.search) : "";

  if (search) {
    const pattern = `*${search}*`;
    query = query.or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `city.ilike.${pattern}`,
        `rbtv_number.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as InterpreterListRow[];
}

export async function getInterpreterById(
  supabase: TypedClient,
  id: string,
): Promise<InterpreterListRow | null> {
  const { data, error } = await supabase
    .from("interpreters")
    .select("*, interpreter_languages(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InterpreterListRow | null;
}

/** Booking counts per interpreter, used to warn before deactivating someone with active work. */
export async function countOpenBookingsForInterpreter(
  supabase: TypedClient,
  interpreterId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("interpreter_id", interpreterId)
    .not("status", "in", "(completed,cancelled,customer_invoiced,paid)");

  if (error) {
    throw error;
  }

  return count ?? 0;
}
