import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { id, hashToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(6).max(20).optional().or(z.literal("")),
  bikeModel: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, phone, bikeModel, city } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verifyToken = id();
  const verifyExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  await db.insert(users).values({
    id: id(),
    name,
    email: normalizedEmail,
    passwordHash,
    phone: phone || null,
    bikeModel: bikeModel || null,
    city: city || null,
    role: "MEMBER",
    approved: false,
    verified: false,
    emailVerified: false,
    // Only the hash is stored — the raw token only ever exists in the
    // email we send below. See hashToken() for why.
    emailVerifyToken: hashToken(verifyToken),
    emailVerifyExpires: verifyExpires,
  });

  // The .catch() still means a failed send never turns into a failed
  // signup for the user — but this must be awaited, not fire-and-forget:
  // Vercel can freeze/tear down a serverless function the instant its HTTP
  // response goes out, which kills any promise still in flight. An
  // un-awaited send() here would often never actually reach Resend at all,
  // which is exactly why verification emails were going missing.
  await sendVerificationEmail(normalizedEmail, name, verifyToken).catch(
    () => {}
  );

  return NextResponse.json({
    ok: true,
    message:
      "Account created! Check your email to confirm your address. An admin also needs to approve your membership before you can register for events or list items — you can still browse everything in the meantime.",
  });
}