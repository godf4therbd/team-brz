import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export type Role = "ADMIN" | "CO_ADMIN" | "MODERATOR" | "MEMBER";

// ADMIN and CO_ADMIN are, by design, functionally identical — CO_ADMIN
// exists only so more than one person can have full access without
// sharing the founding ADMIN account.
export function isAdminRole(role?: Role | string | null) {
  return role === "ADMIN" || role === "CO_ADMIN";
}

// MODERATOR sits below ADMIN/CO_ADMIN: can access a cut-down admin panel
// (approve members, remove/cancel listings & events) but not verify
// riders, award medals, change anyone's role, or write blog/news posts.
export function isStaffRole(role?: Role | string | null) {
  return isAdminRole(role) || role === "MODERATOR";
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminRole(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Admins only." }, { status: 403 }),
    };
  }
  return { session, error: null };
}

// For endpoints Moderators are also allowed to call. Callers still need to
// check session.user.role themselves to restrict *what* a Moderator can do
// within that endpoint (see e.g. the members PATCH route).
export async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session || !isStaffRole(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Staff only." }, { status: 403 }),
    };
  }
  return { session, error: null };
}
