import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Keeps the (anonymous) Supabase auth session fresh on every request so that
 * Server Components can read `auth.uid()`-scoped data. When Supabase is not
 * configured, `updateSession` is a pass-through no-op.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
