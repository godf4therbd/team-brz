import { db, users, events, listings } from "@/db";
import { desc } from "drizzle-orm";

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
