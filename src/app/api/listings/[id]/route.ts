import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/require-admin";
import { db, listings } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "SOLD", "REMOVED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, params.id),
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  const isOwner = listing.sellerId === session.user.id;
  const isAdmin = isAdminRole(session.user.role);
  const isModerator = session.user.role === "MODERATOR";
  if (!isOwner && !isAdmin && !isModerator) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Moderators can only pull a listing down, not reactivate it or mark it
  // sold on someone else's behalf — those stay owner/admin actions.
  if (isModerator && !isOwner && parsed.data.status !== "REMOVED") {
    return NextResponse.json(
      { error: "Moderators can only remove a listing." },
      { status: 403 }
    );
  }

  await db
    .update(listings)
    .set({ status: parsed.data.status })
    .where(eq(listings.id, params.id));

  return NextResponse.json({ ok: true });
}
