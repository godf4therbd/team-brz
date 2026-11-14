import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/require-admin";
import { getMegaTourPaymentsAdmin } from "@/lib/admin-queries";
import { passId } from "@/lib/mega-tour";
import { buildXlsx } from "@/lib/xlsx";

const HEADER = [
  "Pass ID", "Submitted (Dhaka)", "Name", "Phone", "Role", "Bike", "Reg number",
  "Blood group", "Emergency contact", "Reference", "Method",
  "Sender number", "Transaction ID", "Confirmed", "Confirmed by",
];

// Quote every cell, and neutralise a leading = @ (or + / - not followed by
// a digit) so a value like "=HYPERLINK(...)" typed into the public form
// can't run as a formula when the CSV is opened in Excel / Google Sheets.
// Phone numbers like "+8801…" are left alone.
function csvCell(value: string | null | undefined): string {
  let v = value ?? "";
  if (/^[=@\t\r]/.test(v) || /^[+-](?!\d)/.test(v)) v = "'" + v;
  return `"${v.replace(/"/g, '""')}"`;
}

// GET /api/admin/mega-tour/export?format=csv|xlsx  (default csv)
// The .xlsx also opens directly in Google Sheets (File → Import → Upload).
export async function GET(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  const format = req.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const rows = (await getMegaTourPaymentsAdmin()).map((r) => [
    passId(r.serial),
    new Date(r.createdAt + "Z").toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
    r.name, r.phone, r.role === "PILLION" ? "Pillion" : "Rider",
    r.bikeModel, r.regNumber, r.bloodGroup, r.emergencyContact, r.reference,
    r.method, r.senderNumber, r.txId, r.confirmed ? "Yes" : "No",
    r.confirmedBy?.name,
  ]);

  const date = new Date().toISOString().slice(0, 10);
  const base = `mega-tour-2026-payments-${date}`;

  if (format === "xlsx") {
    const file = buildXlsx("Mega Tour 2026", HEADER, rows);
    return new NextResponse(Buffer.from(file), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${base}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // BOM so Excel opens the Bangla text as UTF-8.
  const csv =
    "﻿" +
    [HEADER.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
