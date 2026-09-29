import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, newsPosts } from "@/db";
import { z } from "zod";
import { id as genId } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(5).max(2000),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
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
  const postId = genId();
  await db.insert(newsPosts).values({
    id: postId,
    title: d.title,
    body: d.body,
    sourceUrl: d.sourceUrl || null,
    status: d.status,
    authorId: session!.user.id,
  });

  return NextResponse.json({ ok: true, id: postId });
}
