# Team Brz

A full-stack website for a motorcycle club: members register, admins approve
them, everyone can browse and register for tours/meetups, buy and sell bikes
and gear in a marketplace, and admins can award medals (Host, Leader, etc.)
that show up on rider profiles.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — pages + API routes in one project
- **Tailwind CSS** — dark, racing-themed styling (black / orange / checkered flag)
- **NextAuth** (credentials provider, JWT sessions) — email + password login
- **Drizzle ORM + SQLite** (`better-sqlite3`) — the whole database is one file
  (`data/teambrz.db`), zero external services needed to run it
- **Zod** — input validation on every API route

> Why SQLite instead of Prisma/Postgres? This was built in a sandboxed
> environment that couldn't reach Prisma's binary CDN, so it uses Drizzle +
> SQLite instead — which turned out to be a perfectly good fit for a club
> site this size, and it means you can run the whole thing with **no
> database server to install**. See "Moving to Postgres" below if you outgrow
> it.

## Features

- **Auth & membership** — sign up, sign in; every new account starts
  unapproved. Admins approve members before they can register for events or
  list items (they can still browse everything while pending).
- **Events** — tours, meetups, workshops, charity rides. Public list of
  upcoming/past events, event detail pages, one-click register/cancel,
  capacity + automatic waitlist, and an **RSS feed** at `/feed.xml`.
- **Marketplace** — members list bikes or accessories (engine oil, helmets,
  jackets, etc.) with category, price, condition, and photos; mark items
  sold or remove them.
- **Members directory** — public profiles showing bike, city, verification
  badge, and medals.
- **Medals** — admins define medal types (icon + color, e.g. 🎪 Host, 🧭
  Leader, 👑 Founder) and award them to individual riders; medals show on
  the member directory, profile pages, and event "who's riding" lists.
- **Admin panel** (`/admin`) — approve/verify members, promote admins,
  create/edit/delete events, moderate marketplace listings, manage medal
  types and award them.

## Getting started

```bash
npm install
npm run db:migrate   # creates data/teambrz.db and all tables
npm run db:seed       # loads realistic demo data (see below)
npm run dev           # http://localhost:3000
```

`npm run db:reset` wipes the database and re-runs migrate + seed in one
step — handy while you're customizing things.

### Demo accounts (from `npm run db:seed`)

| Role                       | Email                | Password      |
| -------------------------- | --------------------- | ------------- |
| Admin                       | admin@teambrz.com     | password123   |
| Approved member             | nusrat@teambrz.com    | password123   |
| Member pending approval     | imran@teambrz.com     | password123   |

Change or remove these before going live — `src/db/seed.ts` is safe to
re-run (drop the DB file first) or edit with your club's real roster.

### Environment variables (`.env.local`)

```
DATABASE_URL="file:./data/teambrz.db"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"   # your real domain in production
```

Generate a secret with `openssl rand -base64 32`.

## Project structure

```
src/
  app/            Next.js routes — pages and api/ route handlers
  components/     UI components (admin/ subfolder for admin-only widgets)
  db/             Drizzle schema, DB client, migration + seed scripts
  lib/            auth config, query helpers, utils
drizzle/          generated SQL migrations (drizzle-kit generate)
data/             the SQLite database file lives here (gitignored)
```

## Deploying

The app itself deploys anywhere Next.js runs (Vercel, Railway, Render, a VPS).
The one thing to plan for is the database:

- **Simplest: a host with a persistent disk** (Railway, Render, Fly.io, a
  VPS). Point `DATABASE_URL` at a file path on that disk and it works exactly
  like local dev. Take regular backups of the `.db` file.
- **Serverless (Vercel) with SQLite semantics: Turso.** Turso is a hosted
  libSQL (SQLite-compatible) database built for this. Swap the two lines in
  `src/db/index.ts` and `src/db/migrate.ts` that create a `better-sqlite3`
  client for `drizzle-orm/libsql` + `@libsql/client` pointed at your Turso
  URL — the schema and every query in this app stay identical since libSQL
  speaks the same SQL dialect.
- **Postgres.** If you'd rather run Postgres (Neon, Supabase, RDS), change
  `sqliteTable` → `pgTable` in `src/db/schema.ts`, swap the driver in
  `src/db/index.ts` for `drizzle-orm/node-postgres`, and regenerate
  migrations. More work, but Drizzle's query API you see throughout the app
  doesn't change.

Either way: set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in your host's
environment variables, and make your first admin by seeding one or by
flipping `role` to `ADMIN` directly in the database for your own account
after signing up.

## What else could be added

The brief covered registration, verification, an events feed, a
marketplace, and medals — all of that's here. Beyond that, here's what
would make the most sense to add next, roughly in the order a growing club
tends to need them:

- **Photo uploads** — right now marketplace listings and profile pictures
  take an image URL. Wiring in a storage provider (Cloudinary, UploadThing,
  or S3) would let members upload directly from their phone instead of
  hosting images elsewhere first.
- **Notifications** — email (or WhatsApp/SMS, very common for Bangladeshi
  clubs) when: your membership is approved, an event you registered for is
  coming up, you've been awarded a medal, or someone's interested in your
  listing.
- **In-app contact for the marketplace** — right now buyers see the
  seller's phone number; a simple message thread would keep the
  conversation (and a record of it) inside the site.
- **Paid event registration** — for tours with real costs (fuel, hotel,
  permits), integrating bKash/Nagad/SSLCommaerz so riders can pay the
  registration fee when they sign up, with the admin panel showing who's
  paid.
- **QR check-in at events** — generate a QR code per registration, scan it
  at the meetup point to confirm attendance — feeds nicely into automatic
  "rides attended" counts for medals like 100 Rides.
- **Search & filters** — price range and location filters on the
  marketplace, and date-range/location filters on events, once there are
  enough listings that browsing alone isn't fast enough.
- **Automatic waitlist promotion** — if someone cancels a full event, the
  next person on the waitlist is auto-confirmed and notified, instead of an
  admin doing it by hand.
- **Ride stats & leaderboard** — total distance, tours completed, years
  riding — a nice thing for members to see on their own profile and compare
  with friends.
- **Sponsor/partner directory** — garages, gear shops, or insurance
  partners offering discounts to verified Team Brz members.
- **Bangla language toggle** — since a lot of the club's day-to-day
  communication is in Bangla, a language switch for the public pages could
  help older or newer members who prefer it.
- **PWA support** — installable on a phone home screen with offline access
  to your registrations and profile, so the site feels like an app.
- **Admin analytics** — a simple chart of member growth, most popular event
  types, and marketplace activity over time.
- **Social login** — sign in with Google/Facebook in addition to
  email/password, to lower the signup friction for new members.

None of these need a rebuild — they all sit on top of the schema and
structure already here.
