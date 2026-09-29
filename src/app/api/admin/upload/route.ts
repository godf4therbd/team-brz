import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// A generic image upload for admin-authored content (currently: blog post
// cover images) — unlike /api/account/photo, this doesn't write to any
// table itself; it just stores the file and hands back a URL for the
// caller's own form to submit along with the rest of its fields. See that
// route for why the local-dev fallback only ever runs outside production.
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
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
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
  const filename = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  let url: string;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`covers/${filename}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      url = blob.url;
    } else if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), "public", "uploads", "covers");
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), buffer);
      url = `/uploads/covers/${filename}`;
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

  return NextResponse.json({ ok: true, url });
}
