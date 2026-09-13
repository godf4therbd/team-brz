import { db, events } from "@/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
  const siteUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  const rows = await db.query.events.findMany({
    where: eq(events.status, "PUBLISHED"),
    orderBy: [desc(events.startDate)],
    limit: 50,
  });

  const items = rows
    .map((e) => {
      const link = `${siteUrl}/events/${e.slug}`;
      return `
    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(e.startDate).toUTCString()}</pubDate>
      <category>${escapeXml(e.type)}</category>
      <description>${escapeXml(
        `${e.location} — ${e.description.slice(0, 280)}`
      )}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Team Brz — Events</title>
    <link>${siteUrl}/events</link>
    <description>Upcoming and past Team Brz tours, meetups, and workshops.</description>
    <language>en-us</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
