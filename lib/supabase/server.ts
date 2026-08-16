import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Creates a Supabase client bound to the current request's cookies, for use
 * in Server Components, Server Actions, and Route Handlers. Every query
 * made through this client is subject to Row Level Security as the calling
 * user (or as `anon` when nobody is signed in) - there is no service role
 * key anywhere in this application.
 *
 * Especially important if using Fluid compute: don't put this client in a
 * module-level variable. Always create a new one within each request.
 */
export async function createClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component that can't write cookies. Safe
          // to ignore here because proxy.ts refreshes the session cookie
          // for every /admin request instead.
        }
      },
    },
  });
}
