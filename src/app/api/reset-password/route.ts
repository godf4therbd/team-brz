import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const user = await db.query.users.findFirst({
    where: eq(users.resetToken, token),
  });

  if (!user) {
    return NextResponse.json(
      { error: "This reset link isn't valid. Request a new one." },
      { status: 400 }
    );
  }
  if (user.resetExpires && new Date(user.resetExpires).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This reset link has expired. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db
    .update(users)
    .set({ passwordHash, resetToken: null, resetExpires: null })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
