import { db, events, listings, users, blogPosts, newsPosts } from "@/db";
import { and, count, desc, eq, gte, lt } from "drizzle-orm";

// Public byline columns — never leak passwordHash/tokens onto a blog/news
// page just to show "by <name>".
const postAuthorColumns = { id: true, name: true, avatarUrl: true } as const;

// Reused everywhere a query pulls in a related `users` row (seller,
// registrant, event creator) just to show a name/badge — restricts the
// join to public-facing columns so passwordHash/reset/verify tokens never
// get loaded into a result that might later get passed to a Client
// Component. See the same note on getAllMembersAdmin in admin-queries.ts.
const publicUserColumns = {
  id: true,
  name: true,
  avatarUrl: true,
  bikePhotoUrl: true,
  bikeModel: true,
  city: true,
  role: true,
  verified: true,
  phone: true,
} as const;

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
      registrations: {
        with: { user: { columns: publicUserColumns } },
      },
      createdBy: { columns: publicUserColumns },
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
    with: { seller: { columns: publicUserColumns } },
  });
}

export async function getListingById(id: string) {
  return db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: { seller: { columns: publicUserColumns } },
  });
}

export async function getApprovedMembers() {
  const rows = await db.query.users.findMany({
    where: eq(users.approved, true),
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
      bikeModel: true,
      city: true,
      role: true,
      verified: true,
      joinedAt: true,
    },
    with: { medals: { with: { medal: true } } },
    orderBy: [desc(users.joinedAt)],
  });
  return rows;
}

export async function getMemberById(userId: string) {
  // Used by both the account page (the member viewing themselves — needs
  // email/phone/bio) and the public member-profile page, so this is the
  // widest column set either of those actually renders. Still never
  // touches passwordHash or the reset/verify tokens.
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bikeModel: true,
      bio: true,
      avatarUrl: true,
      bikePhotoUrl: true,
      city: true,
      role: true,
      approved: true,
      verified: true,
      joinedAt: true,
    },
    with: {
      medals: { with: { medal: true } },
      listings: true,
    },
  });
}

export async function getAllMedals() {
  return db.query.medals.findMany();
}

export async function getStats() {
  // These only ever feed a "X members / Y events / Z listings" homepage
  // counter, so ask the DB for counts directly instead of loading every
  // row (including passwordHash and every other column) just to read
  // `.length`.
  const [[memberRow], [eventRow], [listingRow]] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.approved, true)),
    db
      .select({ value: count() })
      .from(events)
      .where(eq(events.status, "PUBLISHED")),
    db
      .select({ value: count() })
      .from(listings)
      .where(eq(listings.status, "ACTIVE")),
  ]);
  return {
    members: memberRow.value,
    events: eventRow.value,
    listings: listingRow.value,
  };
}

// Used by the homepage "Meet the crew" section. Only selects public-facing
// columns (never passwordHash/tokens) since this is passed straight into
// page markup. Admins first, then verified members, newest first.
export async function getFeaturedMembers(limit = 4) {
  const rows = await db.query.users.findMany({
    where: eq(users.approved, true),
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
      bikeModel: true,
      city: true,
      role: true,
      verified: true,
      joinedAt: true,
    },
    orderBy: [desc(users.joinedAt)],
  });

  return rows
    .sort((a, b) => {
      const rank = (m: (typeof rows)[number]) =>
        m.role === "ADMIN" ? 0 : m.verified ? 1 : 2;
      return rank(a) - rank(b);
    })
    .slice(0, limit);
}

// ---------- Blog & News ----------
export async function getPublishedBlogPosts(limit?: number) {
  return db.query.blogPosts.findMany({
    where: eq(blogPosts.status, "PUBLISHED"),
    orderBy: [desc(blogPosts.publishedAt)],
    limit,
    with: { author: { columns: postAuthorColumns } },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "PUBLISHED")),
    with: { author: { columns: postAuthorColumns } },
  });
}

export async function getPublishedNewsPosts(limit?: number) {
  return db.query.newsPosts.findMany({
    where: eq(newsPosts.status, "PUBLISHED"),
    orderBy: [desc(newsPosts.publishedAt)],
    limit,
    with: { author: { columns: postAuthorColumns } },
  });
}
