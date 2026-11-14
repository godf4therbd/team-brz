import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, memberGear } from "@/db";
import { isAdminRole } from "@/lib/require-admin";

// Remove a gear item. Members can remove their own; Admin/Co-Admin can
// remove anyone's (e.g. an inappropriate photo).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const where = isAdminRole(session.user.role)
    ? eq(memberGear.id, id)
    : and(eq(memberGear.id, id), eq(memberGear.userId, session.user.id));

  const deleted = await db
    .delete(memberGear)
    .where(where)
    .returning({ id: memberGear.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Gear item not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
