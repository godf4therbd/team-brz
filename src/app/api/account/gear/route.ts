import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { count, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, memberGear } from "@/db";
import { GEAR_CATEGORIES, MAX_GEAR_ITEMS } from "@/lib/gear";
import { id } from "@/lib/utils";
import {
  storeImage,
  validateImage,
  StorageNotConfiguredError,
} from "@/lib/storage";

const schema = z.object({
  category: z.enum(GEAR_CATEGORIES),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().max(80).optional(),
  note: z.string().trim().max(140).optional(),
});

// Add a gear item to the signed-in member's own profile. Multipart form:
// category, brand, model?, note?, file? (already cropped to JPEG in the
// browser — see components/gear-manager.tsx).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  const userId = session.user.id;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v.trim() ? v : undefined;
  };
  const parsed = schema.safeParse({
    category: str("category"),
    brand: str("brand"),
    model: str("model"),
    note: str("note"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pick a category and enter at least the brand." },
      { status: 400 }
    );
  }

  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(memberGear)
    .where(eq(memberGear.userId, userId));
  if (existing >= MAX_GEAR_ITEMS) {
    return NextResponse.json(
      { error: `You can list up to ${MAX_GEAR_ITEMS} gear items. Remove one first.` },
      { status: 400 }
    );
  }

  let photoUrl: string | null = null;
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    const invalid = validateImage(file);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    try {
      photoUrl = await storeImage("gear", `gear-${userId}-${Date.now()}`, file);
    } catch (err) {
      if (err instanceof StorageNotConfiguredError) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
      console.error("[account/gear] photo upload failed:", err);
      return NextResponse.json(
        { error: "Photo upload failed. Try again, or add the item without a photo." },
        { status: 500 }
      );
    }
  }

  const { category, brand, model, note } = parsed.data;
  await db.insert(memberGear).values({
    id: id(),
    userId,
    category,
    brand,
    model: model || null,
    note: note || null,
    photoUrl,
  });

  return NextResponse.json({ ok: true });
}
