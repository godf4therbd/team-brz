import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";
import * as schema from "./schema";

// Works two ways with the same code:
// - Local dev: DATABASE_URL="file:./data/teambrz.db" (no auth token needed)
// - Netlify/Vercel/any serverless host: DATABASE_URL is a Turso "libsql://..."
//   URL and DATABASE_AUTH_TOKEN is set — see README "Deploying to Netlify".
const url =
  process.env.DATABASE_URL ||
  `file:${path.join(process.cwd(), "data", "teambrz.db")}`;

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from "./schema";
