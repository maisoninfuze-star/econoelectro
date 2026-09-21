import { NextResponse, type NextRequest } from "next/server";
import { toInternalPath } from "@/lib/i18n/routes";

/**
 * Locale routing.
 *  - French (default) is served at the root:      /boutique  -> /fr/boutique (internal rewrite)
 *  - English uses the /en prefix + English slugs: /en/shop   -> /en/boutique (internal rewrite)
 * Internal routes are the French file-system segments under app/[locale]/.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const internal = toInternalPath(pathname);
  if (internal === pathname) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = internal;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Skip Next internals, API routes, static files and well-known files.
    "/((?!api|_next|images|brand|favicon\\.ico|icon\\.png|apple-icon\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
