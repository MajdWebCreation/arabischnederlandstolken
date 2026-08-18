import type { NextRequest } from "next/server";
import { updatePortalSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/tolk")) {
    return updatePortalSession(request, "/tolk/login");
  }

  if (pathname.startsWith("/klant")) {
    return updatePortalSession(request, "/klant/login");
  }

  return updatePortalSession(request, "/admin/login");
}

// Scoped to /admin, /tolk, and /klant only: the public marketing site has
// no session state and should never be touched by this. Server Actions
// bypass proxy matchers entirely (see Next.js Proxy docs), which is why
// every admin/interpreter/customer Server Action also re-checks
// authorization itself instead of relying on this alone.
export const config = {
  matcher: ["/admin/:path*", "/tolk/:path*", "/klant/:path*"],
};
