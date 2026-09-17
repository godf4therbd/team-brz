import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { id } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  // Always return the same response whether or not the account exists,
  // so this endpoint can't be used to check which emails are registered.
  if (user) {
    const token = id();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await db
      .update(users)
      .set({ resetToken: token, resetExpires: expires })
      .where(eq(users.id, user.id));
    sendPasswordResetEmail(user.email, user.name, token).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    message:
      "If an account exists with that email, a reset link has been sent.",
  });
}
