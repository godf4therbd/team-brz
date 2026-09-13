import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { db, listings } from "@/db";
import { id as genId } from "@/lib/utils";

const schema = z.object({
  type: z.enum(["BIKE", "ACCESSORY"]),
  category: z.string().min(2).max(40),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().int().positive().max(100000000),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  location: z.string().max(60).optional().or(z.literal("")),
  images: z.array(z.string().url()).max(6).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  if (!session.user.approved) {
    return NextResponse.json(
      { error: "Your membership is still pending admin approval." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const listingId = genId();
  await db.insert(listings).values({
    id: listingId,
    sellerId: session.user.id,
    type: parsed.data.type,
    category: parsed.data.category,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
    condition: parsed.data.condition,
    location: parsed.data.location || null,
    images: JSON.stringify(parsed.data.images ?? []),
  });

  return NextResponse.json({ ok: true, id: listingId });
}
