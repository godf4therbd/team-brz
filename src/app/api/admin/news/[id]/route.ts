import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, newsPosts } from "@/db";
import { z } from "zod";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(5).max(2000),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const post = await db.query.newsPosts.findFirst({
    where: eq(newsPosts.id, params.id),
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  await db
    .update(newsPosts)
    .set({
      title: d.title,
      body: d.body,
      sourceUrl: d.sourceUrl || null,
      status: d.status,
    })
    .where(eq(newsPosts.id, params.id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await db.delete(newsPosts).where(eq(newsPosts.id, params.id));
  return NextResponse.json({ ok: true });
}
