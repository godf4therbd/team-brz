import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/require-admin";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Real upload, not a paste-a-URL field: profile/bike photos go to Vercel
// Blob storage (see the `put()` call below) once BLOB_READ_WRITE_TOKEN is
// configured. Locally, without that token, we fall back to writing into
// public/uploads/ so the feature is testable without a Blob account — but
// that fallback is refused outside development, since a real deployment's
// filesystem is ephemeral/read-only and a "successful" upload would just
// silently vanish on the next deploy.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const kind = formData.get("kind");
  if (kind !== "avatar" && kind !== "bike") {
    return NextResponse.json(
      { error: "kind must be 'avatar' or 'bike'." },
      { status: 400 }
    );
  }

  // Members upload their own photos; Admin/Co-Admin can additionally set
  // one for any other member (e.g. helping someone who's stuck). Anyone
  // else attempting to set targetUserId gets rejected outright.
  const requestedTargetId = formData.get("targetUserId");
  let targetUserId = session.user.id;
  if (typeof requestedTargetId === "string" && requestedTargetId.length > 0) {
    if (requestedTargetId !== session.user.id) {
      if (!isAdminRole(session.user.role)) {
        return NextResponse.json(
          { error: "Only an admin can set another member's photo." },
          { status: 403 }
        );
      }
      const target = await db.query.users.findFirst({
        where: eq(users.id, requestedTargetId),
        columns: { id: true },
      });
      if (!target) {
        return NextResponse.json({ error: "Member not found." }, { status: 404 });
      }
    }
    targetUserId = requestedTargetId;
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5MB or smaller." },
      { status: 400 }
    );
  }

  const ext = EXT_BY_TYPE[file.type] || "jpg";
  const filename = `${kind}-${targetUserId}-${Date.now()}.${ext}`;

  let url: string;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`${kind}s/${filename}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      url = blob.url;
    } else if (process.env.NODE_ENV !== "production") {
      // Local-dev-only fallback — never runs against a real deployment.
      const dir = path.join(process.cwd(), "public", "uploads", `${kind}s`);
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), buffer);
      url = `/uploads/${kind}s/${filename}`;
    } else {
      return NextResponse.json(
        {
          error:
            "Photo storage isn't configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) in the deployment's environment variables.",
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }

  await db
    .update(users)
    .set(kind === "avatar" ? { avatarUrl: url } : { bikePhotoUrl: url })
    .where(eq(users.id, targetUserId));

  return NextResponse.json({ ok: true, url });
}
