import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { desc, eq, or, sql } from "drizzle-orm";
import { db, megaTourPayments } from "@/db";
import { escapeHtml } from "@/lib/email";
import { id } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Digits only, with Bangladesh's +88 country code dropped, so "+880 1700-000000"
// and "01700000000" are the same number.
export function normalizePhone(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 13 && digits.startsWith("8801")
    ? digits.slice(2)
    : digits;
}

const METHOD_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank: "BRAC Bank",
};

const optional = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  role: z.enum(["rider", "pillion"]),
  bikeModel: optional(100),
  regNumber: optional(100),
  bloodGroup: optional(10),
  emergencyContact: z.string().trim().min(1).max(100),
  reference: optional(100),
  method: z.enum(["bkash", "nagad", "rocket", "bank"]),
  senderNumber: optional(40),
  txId: z.string().trim().min(1).max(100),
});

// Public "Check Payment" lookup — matches either the registration phone or
// the number the payment was sent from. Returns only what the member
// already knows about their own submission (it's shown on their pass).
export async function GET(req: Request) {
  const phone = normalizePhone(new URL(req.url).searchParams.get("phone"));
  if (phone.length < 6) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  try {
    const row = await db.query.megaTourPayments.findFirst({
      where: or(
        eq(megaTourPayments.phoneDigits, phone),
        eq(megaTourPayments.senderDigits, phone)
      ),
      orderBy: [desc(megaTourPayments.createdAt)],
    });
    if (!row) return NextResponse.json({ found: false });
    return NextResponse.json({
      found: true,
      submittedAt: new Date(row.createdAt + "Z").toLocaleString("bn-BD", {
        timeZone: "Asia/Dhaka",
      }),
      name: row.name,
      role: row.role === "PILLION" ? "Pillion" : "Rider",
      method: row.method,
      txId: row.txId,
      bloodGroup: row.bloodGroup ?? "",
      regNumber: row.regNumber ?? "",
      serial: row.serial,
      // Digits-only registration phone — what the pass's QR code encodes.
      phone: row.phoneDigits,
      confirmed: row.confirmed,
    });
  } catch (e) {
    console.error("[mega-tour-payment] lookup failed:", e);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "কিছু তথ্য ঠিক নেই। সব ঘর ঠিকভাবে পূরণ করে আবার চেষ্টা করুন।" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const isPillion = d.role === "pillion";
  const method = METHOD_LABEL[d.method];

  const row = {
    id: id(),
    name: d.name,
    phone: d.phone,
    phoneDigits: normalizePhone(d.phone),
    role: isPillion ? ("PILLION" as const) : ("RIDER" as const),
    // Pillions don't ride their own bike — don't keep the form's leftovers.
    bikeModel: isPillion ? null : d.bikeModel || null,
    regNumber: isPillion ? null : d.regNumber || null,
    bloodGroup: d.bloodGroup || null,
    emergencyContact: d.emergencyContact,
    reference: d.reference || null,
    method,
    senderNumber: d.senderNumber || null,
    senderDigits: normalizePhone(d.senderNumber) || null,
    txId: d.txId,
  };

  // The database is the record of truth: if this fails, the member must
  // be told (they used to see "success" while nothing was saved).
  // The pass/seat number is computed inside the INSERT itself, so two
  // simultaneous submissions can't both read the same max. If they still
  // collide on the unique index, retry with the next number.
  let saved = false;
  let lastError: unknown;
  for (let attempt = 0; attempt < 3 && !saved; attempt++) {
    try {
      await db.insert(megaTourPayments).values({
        ...row,
        serial: sql`(SELECT COALESCE(MAX(${megaTourPayments.serial}), 0) + 1 FROM ${megaTourPayments})`,
      });
      saved = true;
    } catch (e) {
      lastError = e;
    }
  }
  if (!saved) {
    console.error("[mega-tour-payment] save failed:", lastError);
    return NextResponse.json(
      {
        error:
          "দুঃখিত, আপনার তথ্য সেভ করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন, অথবা এডমিনের সাথে যোগাযোগ করুন।",
      },
      { status: 500 }
    );
  }

  // Admin notification — a convenience copy; failure doesn't undo the save.
  if (resend && process.env.ADMIN_EMAIL) {
    const submittedAt = new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" });
    const e = (v: string | null | undefined) => escapeHtml(v || "—");
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM as string,
        to: process.env.ADMIN_EMAIL,
        subject: `Mega Tour 2026 — নতুন Payment Confirmation`,
        html: `
          <h2>Mega Tour 2026 Payment Confirmation</h2>
          <table cellpadding="8" style="border-collapse:collapse">
            <tr><td><b>সময়</b></td><td>${submittedAt}</td></tr>
            <tr><td><b>নাম</b></td><td>${e(row.name)}</td></tr>
            <tr><td><b>ফোন</b></td><td>${e(row.phone)}</td></tr>
            <tr><td><b>ধরন</b></td><td>${isPillion ? "Pillion" : "Rider"}</td></tr>
            ${isPillion ? "" : `<tr><td><b>বাইক</b></td><td>${e(row.bikeModel)}</td></tr><tr><td><b>রেজিস্ট্রেশন</b></td><td>${e(row.regNumber)}</td></tr>`}
            <tr><td><b>Emergency Contact</b></td><td>${e(row.emergencyContact)}</td></tr>
            <tr><td><b>Reference</b></td><td>${e(row.reference)}</td></tr>
            <tr><td><b>Payment Method</b></td><td>${e(method)}</td></tr>
            <tr><td><b>Sender Number</b></td><td>${e(row.senderNumber)}</td></tr>
            <tr><td><b>Transaction ID</b></td><td>${e(row.txId)}</td></tr>
            <tr><td><b>রক্তের গ্রুপ</b></td><td>${e(row.bloodGroup)}</td></tr>
            <tr><td><b>Amount</b></td><td>৳৩,০৬০</td></tr>
          </table>
          <p>Admin panel → Mega Tour থেকে confirm করুন।</p>
        `,
      });
    } catch (err) {
      console.error("[mega-tour-payment] admin email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
