import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase auth session cookie on every /admin or /tolk
 * request and bounces anonymous visitors to the relevant login page early,
 * before any page rendering happens.
 *
 * This is a UX/performance optimisation, not the security boundary: Server
 * Components can't write cookies, so without this, sessions would appear to
 * randomly expire. The actual authorization check (is this user an admin,
 * or an active interpreter?) happens again, authoritatively, in each
 * section's own protected layout and in every Server Action - proxy
 * matchers are easy to misconfigure or bypass (see the Next.js Proxy
 * docs), so nothing here is trusted alone.
 */
export async function updatePortalSession(request: NextRequest, loginPath: string) {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();

  if (!env) {
    // Supabase isn't configured yet. Let the request through; the
    // protected layout will fail closed once it tries to read the session
    // and finds no configuration.
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not add code between createServerClient and getClaims(): a mistake
  // here can make it very hard to debug users being randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === loginPath;

  if (!isLoggedIn && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  return response;
}
