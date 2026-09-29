import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role;
    const isAdminRole = role === "ADMIN" || role === "CO_ADMIN";
    const isStaffRole = isAdminRole || role === "MODERATOR";

    if (!isStaffRole) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Moderators get a cut-down admin panel: they can approve members and
    // remove/cancel listings & events, but can't manage medals, create or
    // edit events, or write blog/news posts. Bounce them out of those
    // sub-routes here rather than letting the page render and relying only
    // on the API to 403 — a redirect is a much clearer signal than a page
    // full of failed fetches.
    if (role === "MODERATOR") {
      const blockedForModerator =
        pathname.startsWith("/admin/medals") ||
        pathname === "/admin/events/new" ||
        /^\/admin\/events\/[^/]+\/edit$/.test(pathname) ||
        pathname.startsWith("/admin/blog") ||
        pathname.startsWith("/admin/news");
      if (blockedForModerator) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
