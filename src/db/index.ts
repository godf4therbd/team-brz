import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import path from "path";
import * as schema from "./schema";

// Works two ways with the same code:
// - Local dev: DATABASE_URL="file:./data/teambrz.db" (no auth token needed)
// - A host with a persistent volume (Railway, Render, Fly.io): DATABASE_URL
//   points at a file on that volume, e.g. "file:/data/teambrz.db"
// - Serverless (Vercel/Netlify): DATABASE_URL is a Turso "libsql://..." URL
//   and DATABASE_AUTH_TOKEN is set — see README "Deploying".
//
// The connection is created lazily (on first real use) rather than at
// import time. That alone isn't enough though: `next build` actually
// renders every page component once (to detect whether it needs
// per-request data), which runs our real queries during the build — and
// on a host like Railway, the production DATABASE_URL points at a volume
// (e.g. /data) that only exists once the app is actually running, not
// during the build step. So during the build specifically, we always
// point at `data/build-schema.db` instead: a tiny, harmless, pre-migrated
// (schema only, zero rows) database file committed to the repo — see
// "npm run db:build-schema". It always exists, answers build-time queries
// with empty results, and is never touched at runtime.
let _db: LibSQLDatabase<typeof schema> | null = null;

function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

    const url = isBuildPhase
      ? `file:${path.join(process.cwd(), "data", "build-schema.db")}`
      : process.env.DATABASE_URL ||
        `file:${path.join(process.cwd(), "data", "teambrz.db")}`;

    const client = createClient({
      url,
      authToken: isBuildPhase ? undefined : process.env.DATABASE_AUTH_TOKEN,
    });

    _db = drizzle(client, { schema });
  }
  return _db;
}

// A Proxy so every existing call site (`db.query...`, `db.insert...`, etc.)
// keeps working unchanged, while the real connection isn't opened until
// one of those properties is actually accessed at request time.
export const db: LibSQLDatabase<typeof schema> = new Proxy(
  {} as LibSQLDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  }
);

export * from "./schema";
