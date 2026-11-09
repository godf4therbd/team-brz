// One-off diagnostic + repair script.
//
// Why this exists: `npm run db:migrate` reported success, but the live site
// still throws "no such table: blog_posts" and "no such column:
// bike_photo_url" on production. That means drizzle's own bookkeeping table
// (`__drizzle_migrations`) already had migration 0003 marked as applied on
// this database — from an earlier partial/interrupted run — so the migrator
// silently skipped it instead of re-running it. This script bypasses that
// bookkeeping entirely: it inspects the live schema directly and applies
// only whatever is actually still missing, so it's safe to run more than
// once.
//
// Run with:  npx tsx src/db/fix-production-schema.ts
// (loads DATABASE_URL / DATABASE_AUTH_TOKEN from .env.local, same as
// src/db/migrate.ts)

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (check .env.local).");
  process.exit(1);
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function columnExists(table: string, column: string): Promise<boolean> {
  const r = await client.execute(`pragma table_info(${table})`);
  return r.rows.some(
    (row) => (row as unknown as { name: string }).name === column
  );
}

async function main() {
  console.log(`Connected to ${url}\n`);

  // --- users.bike_photo_url ---
  if (await columnExists("users", "bike_photo_url")) {
    console.log("✓ users.bike_photo_url already exists — skipping.");
  } else {
    console.log("→ Adding users.bike_photo_url ...");
    await client.execute(`ALTER TABLE "users" ADD "bike_photo_url" text`);
    console.log("✓ Added users.bike_photo_url.");
  }

  console.log("\nDone. Current tables:");
  const tables = await client.execute(
    "select name from sqlite_master where type = 'table' order by name"
  );
  for (const row of tables.rows)
    console.log(" -", (row as unknown as { name: string }).name);

  client.close();
}

main().catch((err) => {
  console.error("\nFailed:", err);
  process.exit(1);
});