import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@libsql/client";

async function main() {
  console.log("Connecting to:", process.env.DATABASE_URL);
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const result = await client.execute("PRAGMA table_info(users);");
  console.log("Columns found:", result.rows.map((r: any) => r.name));
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});