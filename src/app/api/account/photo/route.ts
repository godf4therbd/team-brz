import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/require-admin";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import {
  storeImage,
  validateImage,
  StorageNotConfiguredError,
} from "@/lib/storage";

// Profile / bike photo upload. Storage details live in lib/storage.ts.
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
  const invalid = validateImage(file);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  let url: string;
  try {
    url = await storeImage(`${kind}s`, `${kind}-${targetUserId}-${Date.now()}`, file);
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    // Log the real error — the response to the browser stays generic, but
    // without this the server logs show nothing at all for a failed
    // upload, making it impossible to tell a bad/missing Blob token apart
    // from a network error, a file-size rejection from Blob's own API, etc.
    console.error("[account/photo] upload failed:", err);
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