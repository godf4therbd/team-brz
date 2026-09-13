import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, userMedals } from "@/db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  medalId: z.string().min(1),
  note: z.string().max(200).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const existing = await db.query.userMedals.findFirst({
    where: and(
      eq(userMedals.userId, parsed.data.userId),
      eq(userMedals.medalId, parsed.data.medalId)
    ),
  });
  if (existing) {
    return NextResponse.json(
      { error: "This rider already has that medal." },
      { status: 409 }
    );
  }

  await db.insert(userMedals).values({
    userId: parsed.data.userId,
    medalId: parsed.data.medalId,
    note: parsed.data.note || null,
    awardedById: session!.user.id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.pick({ userId: true, medalId: true }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  await db
    .delete(userMedals)
    .where(
      and(
        eq(userMedals.userId, parsed.data.userId),
        eq(userMedals.medalId, parsed.data.medalId)
      )
    );

  return NextResponse.json({ ok: true });
}
