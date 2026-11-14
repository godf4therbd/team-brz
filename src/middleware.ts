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
    // remove listings, but can't manage medals. Bounce them out of that
    // sub-route here rather than letting the page render and relying only
    // on the API to 403.
    if (role === "MODERATOR") {
      const blockedForModerator = pathname.startsWith("/admin/medals");
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
