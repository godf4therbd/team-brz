import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, medals } from "@/db";
import { z } from "zod";
import { id as genId } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(40),
  description: z.string().max(200).optional().or(z.literal("")),
  icon: z.string().min(1).max(8),
  color: z.string().min(4).max(9),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await db.insert(medals).values({
    id: genId(),
    name: parsed.data.name,
    description: parsed.data.description || null,
    icon: parsed.data.icon,
    color: parsed.data.color,
  });

  return NextResponse.json({ ok: true });
}
