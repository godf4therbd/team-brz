import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const url =
  process.env.DATABASE_URL || `file:${path.join(dataDir, "teambrz.db")}`;

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

async function main() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log(`Migrations applied to ${url}`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
