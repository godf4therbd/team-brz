import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, events } from "@/db";
import { z } from "zod";
import { id as genId, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

const schema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  type: z.enum(["TOUR", "MEETUP", "WORKSHOP", "CHARITY", "OTHER"]),
  location: z.string().min(2).max(120),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal("")),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  let slug = slugify(d.title);
  const existing = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const eventId = genId();
  await db.insert(events).values({
    id: eventId,
    slug,
    title: d.title,
    description: d.description,
    type: d.type,
    location: d.location,
    startDate: new Date(d.startDate).toISOString(),
    endDate: d.endDate ? new Date(d.endDate).toISOString() : null,
    capacity: d.capacity ?? null,
    status: d.status,
    coverImage: d.coverImage || null,
    createdById: session!.user.id,
  });

  return NextResponse.json({ ok: true, id: eventId, slug });
}
