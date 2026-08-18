import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type TypedClient = SupabaseClient<Database>;

export type BusinessSettings = Database["public"]["Tables"]["business_settings"]["Row"];

/**
 * business_settings is a singleton by convention (exactly one row, seeded
 * by migration - see 20260818100000_business_settings.sql). Ordering by
 * created_at and taking the first row is a defensive fallback, not a sign
 * multiple rows are expected; nothing in the app ever inserts a second one.
 */
export async function getBusinessSettings(
  supabase: TypedClient,
): Promise<BusinessSettings> {
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("business_settings ontbreekt - dit zou nooit moeten gebeuren.");
  }

  return data;
}
