import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

// Single shared SQLite file for the whole app. In production you'd swap
// this file for a hosted Postgres/MySQL connection (see README) — the
// Drizzle query API used throughout the app stays the same either way.
const dbPath = process.env.DATABASE_URL?.replace("file:", "") ||
  path.join(process.cwd(), "data", "teambrz.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export * from "./schema";
