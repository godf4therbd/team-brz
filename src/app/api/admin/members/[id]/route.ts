import { NextRequest, NextResponse } from "next/server";
import { requireStaff, requireAdmin, isAdminRole } from "@/lib/require-admin";
import { db, users } from "@/db";
import { and, count, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { sendVerifiedBadgeEmail } from "@/lib/email";

const schema = z.object({
  approved: z.boolean().optional(),
  verified: z.boolean().optional(),
  role: z.enum(["ADMIN", "CO_ADMIN", "MODERATOR", "MEMBER"]).optional(),
  // Same bounds as the name field on signup — see /api/register/route.ts.
  name: z.string().min(2).max(80).optional(),
});

const FULL_ADMIN_ROLES = ["ADMIN", "CO_ADMIN"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Moderators can reach this endpoint too (to approve/unapprove members),
  // but only Admin/Co-Admin may touch `verified` or `role` — enforced
  // below, since requireStaff() alone can't know which fields the body
  // will contain.
  const { session, error } = await requireStaff();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  if (
    session!.user.role === "MODERATOR" &&
    Object.keys(parsed.data).some((k) => k !== "approved")
  ) {
    return NextResponse.json(
      { error: "Moderators can only approve or unapprove members." },
      { status: 403 }
    );
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

  // Demoting a full admin (ADMIN or CO_ADMIN — the two are equal in power)
  // down to MEMBER/MODERATOR is the one change that can lock everyone out
  // of the admin panel, so it gets two guards: you can never demote
  // yourself (even if other admins exist — do it from another admin's
  // account), and the last remaining full admin can never be demoted at
  // all.
  const wasFullAdmin = isAdminRole(before.role);
  const willStayFullAdmin =
    parsed.data.role === undefined || isAdminRole(parsed.data.role);
  const isDemotingFullAdmin = wasFullAdmin && !willStayFullAdmin;

  if (isDemotingFullAdmin) {
    if (before.id === session!.user.id) {
      return NextResponse.json(
        { error: "You can't remove your own admin access." },
        { status: 400 }
      );
    }
    const [{ value: otherAdmins }] = await db
      .select({ value: count() })
      .from(users)
      .where(
        and(inArray(users.role, FULL_ADMIN_ROLES), ne(users.id, before.id))
      );
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
    // Awaited, not fire-and-forget — see forgot-password/route.ts for why:
    // Vercel can tear down a serverless function right after its response
    // is sent, which silently kills an un-awaited send() before it ever
    // reaches Resend.
    await sendVerifiedBadgeEmail(before.email, before.name).catch(() => {});
  }

  return NextResponse.json({ ok: true, rowsAffected });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Unlike PATCH, deleting a member is Admin/Co-Admin only — a Moderator
  // can approve/unapprove someone but never remove their account outright.
  const { session, error } = await requireAdmin();
  if (error) return error;

  const target = await db.query.users.findFirst({
    where: eq(users.id, params.id),
  });
  if (!target) {
    return NextResponse.json(
      { error: `No member found with id ${params.id}.` },
      { status: 404 }
    );
  }

  if (target.id === session!.user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  // Same "never leave the club without an admin" guard as the demotion
  // check above.
  if (isAdminRole(target.role)) {
    const [{ value: otherAdmins }] = await db
      .select({ value: count() })
      .from(users)
      .where(
        and(inArray(users.role, FULL_ADMIN_ROLES), ne(users.id, target.id))
      );
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "Can't delete the last remaining admin." },
        { status: 400 }
      );
    }
  }

  try {
    await db.delete(users).where(eq(users.id, target.id));
  } catch (err) {
    // userMedals/eventRegistrations/listings all cascade-delete with the
    // user (see schema.ts), but blog posts, news posts, events, and medal
    // awards they *authored/created/awarded* don't — deleting someone who
    // has any of that content can hit a foreign-key constraint. Rather
    // than silently 500, say so: the admin can reassign/delete that
    // content first, or (more commonly) just leave the account in place
    // and remove their access via role/approved instead.
    console.error("[admin/members delete] failed:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't delete this member — they likely have blog posts, news posts, events, or medal awards tied to their account. Reassign or remove that content first, or revoke their access instead of deleting the account.",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}