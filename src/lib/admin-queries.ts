import { db, users, events, listings, blogPosts, newsPosts } from "@/db";
import { desc, eq } from "drizzle-orm";

// Reused by both admin blog/news lists and their edit pages — never leak
// passwordHash/tokens just to show "by <name>" on a post.
const postAuthorColumns = { id: true, name: true } as const;

export async function getAllMembersAdmin() {
  // IMPORTANT: this result is passed straight into a Client Component
  // (MembersTable), so whatever columns we select here get serialized
  // and shipped to the browser. Never select passwordHash or the
  // verify/reset tokens — only the fields the admin table actually
  // displays or needs.
  return db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bikeModel: true,
      avatarUrl: true,
      bikePhotoUrl: true,
      city: true,
      role: true,
      approved: true,
      verified: true,
      emailVerified: true,
      joinedAt: true,
    },
    orderBy: [desc(users.joinedAt)],
    with: { medals: { with: { medal: true } } },
  });
}

export async function getAllEventsAdmin() {
  return db.query.events.findMany({
    orderBy: [desc(events.startDate)],
    with: { registrations: true },
  });
}

export async function getAllListingsAdmin() {
  return db.query.listings.findMany({
    orderBy: [desc(listings.createdAt)],
    // Admin marketplace list only ever shows the seller's name — never
    // load passwordHash/tokens just to join it in.
    with: { seller: { columns: { id: true, name: true } } },
  });
}

export async function getAllMedalsAdmin() {
  return db.query.medals.findMany();
}

export async function getAllBlogPostsAdmin() {
  return db.query.blogPosts.findMany({
    orderBy: [desc(blogPosts.publishedAt)],
    with: { author: { columns: postAuthorColumns } },
  });
}

export async function getBlogPostByIdAdmin(id: string) {
  return db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
}

export async function getAllNewsPostsAdmin() {
  return db.query.newsPosts.findMany({
    orderBy: [desc(newsPosts.publishedAt)],
    with: { author: { columns: postAuthorColumns } },
  });
}

export async function getNewsPostByIdAdmin(id: string) {
  return db.query.newsPosts.findFirst({ where: eq(newsPosts.id, id) });
}
