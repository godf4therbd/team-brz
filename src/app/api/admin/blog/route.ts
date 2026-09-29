import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { db, blogPosts } from "@/db";
import { z } from "zod";
import { id as genId, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

// Blog/news authoring is Admin/Co-Admin only — Moderators don't get this
// (see require-admin.ts and the middleware redirect for /admin/blog).
const schema = z.object({
  title: z.string().min(3).max(150),
  coverImage: z.string().url().optional().or(z.literal("")),
  body: z.string().min(20).max(20000),
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
  let slug = slugify(d.title);
  const existing = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const postId = genId();
  await db.insert(blogPosts).values({
    id: postId,
    slug,
    title: d.title,
    coverImage: d.coverImage || null,
    body: d.body,
    status: d.status,
    authorId: session!.user.id,
  });

  return NextResponse.json({ ok: true, id: postId, slug });
}
