import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/require-admin";
import { getMegaTourPaymentsAdmin } from "@/lib/admin-queries";

// Quote every cell, and neutralise a leading = @ (or + / - not followed by
// a digit) so a value like "=HYPERLINK(...)" typed into the public form
// can't run as a formula when the CSV is opened in Excel / Google Sheets.
// Phone numbers like "+8801…" are left alone.
function cell(value: string | null | undefined): string {
  let v = value ?? "";
  if (/^[=@\t\r]/.test(v) || /^[+-](?!\d)/.test(v)) v = "'" + v;
  return `"${v.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  const rows = await getMegaTourPaymentsAdmin();
  const header = [
    "Submitted (Dhaka)", "Name", "Phone", "Role", "Bike", "Reg number",
    "Blood group", "Emergency contact", "Reference", "Method",
    "Sender number", "Transaction ID", "Confirmed", "Confirmed by",
  ];
  const lines = rows.map((r) =>
    [
      new Date(r.createdAt + "Z").toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
      r.name, r.phone, r.role === "PILLION" ? "Pillion" : "Rider",
      r.bikeModel, r.regNumber, r.bloodGroup, r.emergencyContact, r.reference,
      r.method, r.senderNumber, r.txId, r.confirmed ? "Yes" : "No",
      r.confirmedBy?.name,
    ]
      .map(cell)
      .join(",")
  );

  // BOM so Excel opens the Bangla text as UTF-8.
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mega-tour-2026-payments-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
