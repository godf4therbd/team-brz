import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, events } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(4000).optional(),
  type: z.enum(["TOUR", "MEETUP", "WORKSHOP", "CHARITY", "OTHER"]).optional(),
  location: z.string().min(2).max(120).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
  coverImage: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (update.startDate)
    update.startDate = new Date(update.startDate as string).toISOString();
  if (update.endDate)
    update.endDate = new Date(update.endDate as string).toISOString();

  await db.update(events).set(update).where(eq(events.id, params.id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await db.delete(events).where(eq(events.id, params.id));

  return NextResponse.json({ ok: true });
}
