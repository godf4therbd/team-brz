import { db, events, listings, users } from "@/db";
import { and, desc, eq, gte, lt } from "drizzle-orm";

export async function getUpcomingEvents(limit?: number) {
  const now = new Date().toISOString();
  const rows = await db.query.events.findMany({
    where: and(eq(events.status, "PUBLISHED"), gte(events.startDate, now)),
    orderBy: [events.startDate],
    limit,
    with: { registrations: true },
  });
  return rows;
}

export async function getPastEvents(limit?: number) {
  const now = new Date().toISOString();
  const rows = await db.query.events.findMany({
    where: and(eq(events.status, "PUBLISHED"), lt(events.startDate, now)),
    orderBy: [desc(events.startDate)],
    limit,
    with: { registrations: true },
  });
  return rows;
}

export async function getEventBySlug(slug: string) {
  return db.query.events.findFirst({
    where: eq(events.slug, slug),
    with: {
      registrations: { with: { user: true } },
      createdBy: true,
    },
  });
}

export async function getActiveListings(opts?: {
  type?: "BIKE" | "ACCESSORY";
  limit?: number;
}) {
  const conditions = [eq(listings.status, "ACTIVE")];
  if (opts?.type) conditions.push(eq(listings.type, opts.type));
  return db.query.listings.findMany({
    where: and(...conditions),
    orderBy: [desc(listings.createdAt)],
    limit: opts?.limit,
    with: { seller: true },
  });
}

export async function getListingById(id: string) {
  return db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: { seller: true },
  });
}

export async function getApprovedMembers() {
  const rows = await db.query.users.findMany({
    where: eq(users.approved, true),
    with: { medals: { with: { medal: true } } },
    orderBy: [desc(users.joinedAt)],
  });
  return rows;
}

export async function getMemberById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { medals: { with: { medal: true } }, listings: true },
  });
}

export async function getAllMedals() {
  return db.query.medals.findMany();
}

export async function getStats() {
  const [memberRows, eventRows, listingRows] = await Promise.all([
    db.query.users.findMany({ where: eq(users.approved, true) }),
    db.query.events.findMany({ where: eq(events.status, "PUBLISHED") }),
    db.query.listings.findMany({ where: eq(listings.status, "ACTIVE") }),
  ]);
  return {
    members: memberRows.length,
    events: eventRows.length,
    listings: listingRows.length,
  };
}
