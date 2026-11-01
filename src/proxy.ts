import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only (cookie present?). Real authorization happens in
// requireOrgSession() on every page/action — never rely on this file alone.
export function proxy(request: NextRequest) {
  // Server actions can't follow a redirect to HTML. requireOrgSession() redirects them itself.
  if (request.headers.has("next-action")) return NextResponse.next();
  if (!getSessionCookie(request)) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/team/:path*", "/billing/:path*", "/onboarding"],
};
