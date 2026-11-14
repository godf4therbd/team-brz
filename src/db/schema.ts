import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------- Users ----------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  bikeModel: text("bike_model"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bikePhotoUrl: text("bike_photo_url"),
  city: text("city"),
  // ADMIN and CO_ADMIN have identical, full permissions everywhere in the
  // app — CO_ADMIN exists only so the club can have more than one person
  // with full access without sharing the founding ADMIN account.
  // MODERATOR is deliberately limited: can approve members and
  // remove listings, but can't verify riders, award medals,
  // change anyone's role, or write news posts.
  // MEMBER is a regular account.
  role: text("role", { enum: ["ADMIN", "CO_ADMIN", "MODERATOR", "MEMBER"] })
    .notNull()
    .default("MEMBER"),
  // approved = admin let them into the club roster at all
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  // verified = admin has verified their identity/bike ownership (badge)
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  joinedAt: text("joined_at")
    .notNull()
    .default(sql`(current_timestamp)`),

  // ---- Email verification (confirm-your-address link sent at signup) ----
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  emailVerifyToken: text("email_verify_token"),
  emailVerifyExpires: text("email_verify_expires"), // ISO datetime

  // ---- Password reset ----
  resetToken: text("reset_token"),
  resetExpires: text("reset_expires"), // ISO datetime
});

export const usersRelations = relations(users, ({ many }) => ({
  medals: many(userMedals, { relationName: "medal_owner" }),
  medalsAwarded: many(userMedals, { relationName: "medal_awarder" }),
  listings: many(listings),
}));

// ---------- Medals ----------
export const medals = sqliteTable("medals", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g. "Host", "Leader", "Founding Member"
  description: text("description"),
  icon: text("icon").notNull().default("🏅"), // emoji or short code
  color: text("color").notNull().default("#f97316"),
});

export const medalsRelations = relations(medals, ({ many }) => ({
  awards: many(userMedals),
}));

export const userMedals = sqliteTable(
  "user_medals",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    medalId: text("medal_id")
      .notNull()
      .references(() => medals.id, { onDelete: "cascade" }),
    awardedAt: text("awarded_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    awardedById: text("awarded_by_id").references(() => users.id),
    note: text("note"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.medalId] }),
  })
);

export const userMedalsRelations = relations(userMedals, ({ one }) => ({
  user: one(users, {
    fields: [userMedals.userId],
    references: [users.id],
    relationName: "medal_owner",
  }),
  medal: one(medals, {
    fields: [userMedals.medalId],
    references: [medals.id],
  }),
  awardedBy: one(users, {
    fields: [userMedals.awardedById],
    references: [users.id],
    relationName: "medal_awarder",
  }),
}));

// ---------- Marketplace ----------
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["BIKE", "ACCESSORY"] }).notNull(),
  category: text("category").notNull(), // e.g. "Helmet", "Engine Oil", "Sport Bike"
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // BDT, integer taka
  condition: text("condition", {
    enum: ["NEW", "LIKE_NEW", "GOOD", "FAIR"],
  })
    .notNull()
    .default("GOOD"),
  images: text("images").notNull().default("[]"), // JSON array of URLs
  location: text("location"),
  status: text("status", {
    enum: ["ACTIVE", "SOLD", "REMOVED"],
  })
    .notNull()
    .default("ACTIVE"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const listingsRelations = relations(listings, ({ one }) => ({
  seller: one(users, { fields: [listings.sellerId], references: [users.id] }),
}));

