import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";
import * as schema from "@/db/schema";

/** In-process Postgres with the real migrations (including RLS) applied. */
export async function testDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.resolve(__dirname, "../drizzle") });
  return db;
}

export async function seedOrgs(db: Awaited<ReturnType<typeof testDb>>) {
  await db.insert(schema.user).values([
    { id: "u1", name: "Ada", email: "ada@example.com" },
    { id: "u2", name: "Bob", email: "bob@example.com" },
  ]);
  await db.insert(schema.organization).values([
    { id: "orgA", name: "Org A", slug: "org-a" },
    { id: "orgB", name: "Org B", slug: "org-b" },
  ]);
}
