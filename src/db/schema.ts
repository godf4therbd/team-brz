import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  uniqueIndex,
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
  city: text("city"),
  // ADMIN can manage everything, MEMBER is a regular account
  role: text("role", { enum: ["ADMIN", "MEMBER"] })
    .notNull()
    .default("MEMBER"),
  // approved = admin let them into the club roster at all
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  // verified = admin has verified their identity/bike ownership (badge)
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  joinedAt: text("joined_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const usersRelations = relations(users, ({ many }) => ({
  medals: many(userMedals, { relationName: "medal_owner" }),
  medalsAwarded: many(userMedals, { relationName: "medal_awarder" }),
  eventRegistrations: many(eventRegistrations),
  listings: many(listings),
  eventsCreated: many(events),
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

// ---------- Events ----------
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", {
    enum: ["TOUR", "MEETUP", "WORKSHOP", "CHARITY", "OTHER"],
  })
    .notNull()
    .default("TOUR"),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(), // ISO datetime
  endDate: text("end_date"),
  coverImage: text("cover_image"),
  capacity: integer("capacity"),
  status: text("status", {
    enum: ["DRAFT", "PUBLISHED", "CANCELLED"],
  })
    .notNull()
    .default("PUBLISHED"),
  createdById: text("created_by_id").references(() => users.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrations = sqliteTable(
  "event_registrations",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
    })
      .notNull()
      .default("CONFIRMED"),
    registeredAt: text("registered_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => ({
    uniqPair: uniqueIndex("event_registrations_event_user_uniq").on(
      t.eventId,
      t.userId
    ),
  })
);

export const eventRegistrationsRelations = relations(
  eventRegistrations,
  ({ one }) => ({
    event: one(events, {
      fields: [eventRegistrations.eventId],
      references: [events.id],
    }),
    user: one(users, {
      fields: [eventRegistrations.userId],
      references: [users.id],
    }),
  })
);

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
