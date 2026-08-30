import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Keeps the (anonymous) Supabase auth session fresh on every request so that
 * Server Components can read `auth.uid()`-scoped data. When Supabase is not
 * configured, `updateSession` is a pass-through no-op.
 *
 * Also turns a malformed `/problems/<id>` (old `seed-*` links, crawler noise,
 * typos) into a real HTTP 404 instead of a soft 200. A well-formed id that
 * simply has no row still renders the branded not-found page from the route.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/problems\/([^/]+)\/?$/);
  if (match && match[1] !== "new" && !UUID_RE.test(decodeURIComponent(match[1]))) {
    const url = request.nextUrl.clone();
    url.pathname = "/_not-found";
    return NextResponse.rewrite(url, { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
