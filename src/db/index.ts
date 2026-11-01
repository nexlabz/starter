import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

// One pool per server instance (kept across dev hot reloads).
const g = globalThis as unknown as { __pgPool?: Pool };

function createPool() {
  const url = getEnv().DATABASE_URL;
  return new Pool({
    connectionString: url,
    max: 5,
    // Neon / most hosted Postgres require TLS; local docker does not.
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: true },
  });
}

const pool = g.__pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") g.__pgPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
