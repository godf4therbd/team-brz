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
//
// IMPORTANT: the build-phase client must never be memoized into `_db`.
// Vercel's serverless runtime can reuse the very same warm Node process
// (and therefore the same in-memory module state) that "next build"'s
// page-data-collection step ran in for the first request(s) a fresh
// deployment serves. If that first call had latched `_db` onto the
// build-schema.db client, every later request handled by that same warm
// instance would keep silently querying the empty local build DB instead
// of the real production database — which is exactly what caused
// intermittent "no such table: blog_posts" / "no such column:
// bike_photo_url" errors even right after a redeploy with a verified,
// already-fixed production schema. Only the real, env-configured client is
// ever cached; the build-phase client is recreated (and discarded) on
// every call so it can never leak into runtime request handling.
let _db: LibSQLDatabase<typeof schema> | null = null;

function getDb(): LibSQLDatabase<typeof schema> {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (isBuildPhase) {
    const client = createClient({
      url: `file:${path.join(process.cwd(), "data", "build-schema.db")}`,
    });
    return drizzle(client, { schema });
  }

  if (!_db) {
    const url =
      process.env.DATABASE_URL ||
      `file:${path.join(process.cwd(), "data", "teambrz.db")}`;

    const client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
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