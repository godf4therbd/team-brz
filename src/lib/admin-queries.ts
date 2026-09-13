import { db, users, events, listings } from "@/db";
import { desc } from "drizzle-orm";

export async function getAllMembersAdmin() {
  return db.query.users.findMany({
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
    with: { seller: true },
  });
}

export async function getAllMedalsAdmin() {
  return db.query.medals.findMany();
}
