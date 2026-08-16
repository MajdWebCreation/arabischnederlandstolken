import type { NextRequest } from "next/server";
import { updateAdminSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateAdminSession(request);
}

// Scoped to /admin only: the public marketing site has no session state and
// should never be touched by this. Server Actions bypass proxy matchers
// entirely (see Next.js Proxy docs), which is why every admin Server Action
// also re-checks authorization itself instead of relying on this alone.
export const config = {
  matcher: ["/admin/:path*"],
};
