import { db, users, listings, megaTourPayments } from "@/db";
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
      avatarUrl: true,
      bikePhotoUrl: true,
      city: true,
      role: true,
      approved: true,
      verified: true,
      joinedAt: true,
    },
    orderBy: [desc(users.joinedAt)],
    with: { medals: { with: { medal: true } } },
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


export async function getMegaTourPaymentsAdmin() {
  return db.query.megaTourPayments.findMany({
    orderBy: [desc(megaTourPayments.createdAt)],
    // Only the confirming admin's name — never their password hash/tokens.
    with: { confirmedBy: { columns: { name: true } } },
  });
}
