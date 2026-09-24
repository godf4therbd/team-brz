import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const base = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${base}/verify-email?status=missing`);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.emailVerifyToken, hashToken(token)),
  });

  if (!user) {
    return NextResponse.redirect(`${base}/verify-email?status=invalid`);
  }

  if (
    user.emailVerifyExpires &&
    new Date(user.emailVerifyExpires).getTime() < Date.now()
  ) {
    return NextResponse.redirect(`${base}/verify-email?status=expired`);
  }

  await db
    .update(users)
    .set({
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    })
    .where(eq(users.id, user.id));

  return NextResponse.redirect(`${base}/verify-email?status=success`);
}
