import { NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function normalizePhone(value: string) {
  return (value ?? "").replace(/\D/g, "");
}

export function findMatchingRow(rows: string[][], phone: string) {
  const normalizedPhone = normalizePhone(phone);
  return rows.find((row) => {
    const registrationPhone = normalizePhone(row[2] ?? "");
    const senderPhone = normalizePhone(row[8] ?? "");
    return registrationPhone === normalizedPhone || senderPhone === normalizedPhone;
  });
}

async function appendToSheet(values: string[]) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

async function getSheetRows() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:L",
  });
  return res.data.values ?? [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  try {
    const rows = await getSheetRows();
    const row = findMatchingRow(rows, phone);
    if (!row) return NextResponse.json({ found: false });
    return NextResponse.json({
      found: true,
      submittedAt: row[0] ?? "",
      name: row[1] ?? "",
      role: row[3] ?? "",
      method: row[7] ?? "",
      txId: row[9] ?? "",
      bloodGroup: row[10] ?? "",
      confirmed: (row[11] ?? "").toString().trim().toLowerCase() === "done",
    });
  } catch (e) {
    console.error("Sheet read error:", e);
    return NextResponse.json({ error: "sheet error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { name, phone, bloodGroup, role, bikeModel, regNumber, emergencyContact, reference, senderNumber, txId, method } =
    await req.json();

  const methodLabel: Record<string, string> = {
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    bank: "BRAC Bank",
  };

  const submittedAt = new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" });

  // Save to Google Sheet
  try {
    await appendToSheet([
      submittedAt,
      name,
      phone,
      role === "pillion" ? "Pillion" : "Rider",
      bikeModel ?? "",
      regNumber ?? "",
      emergencyContact,
      methodLabel[method] ?? method,
      senderNumber ?? "",
      txId,
      bloodGroup ?? "",
      "", // L: payment confirmation ("done"), filled manually by admin
      reference ?? "",
    ]);
  } catch (e) {
    console.error("Google Sheets error:", e);
  }

  // Send email notification
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM as string,
        to: process.env.ADMIN_EMAIL as string,
        subject: `Mega Tour 2026 — নতুন Payment Confirmation`,
        html: `
          <h2>Mega Tour 2026 Payment Confirmation</h2>
          <table cellpadding="8" style="border-collapse:collapse">
            <tr><td><b>সময়</b></td><td>${submittedAt}</td></tr>
            <tr><td><b>নাম</b></td><td>${name}</td></tr>
            <tr><td><b>ফোন</b></td><td>${phone}</td></tr>
            <tr><td><b>ধরন</b></td><td>${role === "pillion" ? "Pillion" : "Rider"}</td></tr>
            ${role !== "pillion" ? `<tr><td><b>বাইক</b></td><td>${bikeModel}</td></tr><tr><td><b>রেজিস্ট্রেশন</b></td><td>${regNumber}</td></tr>` : ""}
            <tr><td><b>Emergency Contact</b></td><td>${emergencyContact}</td></tr>
            <tr><td><b>Reference</b></td><td>${reference ?? "—"}</td></tr>
            <tr><td><b>Payment Method</b></td><td>${methodLabel[method] ?? method}</td></tr>
            <tr><td><b>Sender Number</b></td><td>${senderNumber}</td></tr>
            <tr><td><b>Transaction ID</b></td><td>${txId}</td></tr>
            <tr><td><b>রক্তের গ্রুপ</b></td><td>${bloodGroup ?? "—"}</td></tr>
            <tr><td><b>Amount</b></td><td>৳৩,০৬০</td></tr>
          </table>
        `,
      });
    } catch {
      // email failure is non-fatal
    }
  }

  return NextResponse.json({ ok: true });
}
