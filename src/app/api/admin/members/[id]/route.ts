import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, users } from "@/db";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { sendVerifiedBadgeEmail } from "@/lib/email";

const schema = z.object({
  approved: z.boolean().optional(),
  verified: z.boolean().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // Look up the current row first so we only email on a real
  // false -> true transition, not on every save that happens to
  // include verified: true again.
  const before = await db.query.users.findFirst({
    where: eq(users.id, params.id),
  });

  if (!before) {
    return NextResponse.json(
      { error: `No member found with id ${params.id}.` },
      { status: 404 }
    );
  }

  // Demoting an admin to MEMBER is the one change that can lock everyone
  // out of the admin panel, so it gets two guards: you can never demote
  // yourself (even if other admins exist — do it from another admin's
  // account), and the last remaining admin can never be demoted at all.
  const isDemotingAdmin =
    before.role === "ADMIN" && parsed.data.role === "MEMBER";
  if (isDemotingAdmin) {
    if (before.id === session!.user.id) {
      return NextResponse.json(
        { error: "You can't remove your own admin access." },
        { status: 400 }
      );
    }
    const [{ value: otherAdmins }] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "ADMIN"), ne(users.id, before.id)));
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "Can't demote the last remaining admin." },
        { status: 400 }
      );
    }
  }

  const result = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, params.id));

  // libsql's ResultSet reports how many rows the UPDATE actually
  // touched. If this is 0 despite `before` existing a moment ago,
  // something is wrong with the write itself (not a permissions or
  // "member not found" issue) — surface it instead of silently
  // reporting success.
  const rowsAffected = (result as unknown as { rowsAffected?: number })
    .rowsAffected;
  if (rowsAffected === 0) {
    return NextResponse.json(
      {
        error: `Update matched 0 rows for id ${params.id} even though the member exists. Check server logs.`,
      },
      { status: 500 }
    );
  }

  if (!before.verified && parsed.data.verified === true) {
    sendVerifiedBadgeEmail(before.email, before.name).catch(() => {});
  }

  return NextResponse.json({ ok: true, rowsAffected });
}
