import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, megaTourPayments } from "@/db";
import { requireAdmin, requireStaff } from "@/lib/require-admin";

const schema = z.object({ confirmed: z.boolean() });

// Confirm / un-confirm a payment after checking it against the bKash/Nagad/
// bank statement. Moderators can do this too — it's day-to-day admin work.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { session, error } = await requireStaff();
  if (error) return error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { confirmed } = parsed.data;
  const updated = await db
    .update(megaTourPayments)
    .set({
      confirmed,
      confirmedAt: confirmed ? new Date().toISOString() : null,
      confirmedById: confirmed ? session!.user.id : null,
    })
    .where(eq(megaTourPayments.id, id))
    .returning({ id: megaTourPayments.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// Remove a duplicate or test submission. Admin/Co-Admin only.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const deleted = await db
    .delete(megaTourPayments)
    .where(eq(megaTourPayments.id, id))
    .returning({ id: megaTourPayments.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
