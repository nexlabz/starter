import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

/**
 * Tenant-scoped transaction. EVERY query on a tenant table must go through this.
 *
 * Inside the transaction we (1) switch to the restricted `app_rls` role, which has
 * no BYPASSRLS, and (2) set `app.org_id`, which the RLS policies compare against
 * `org_id`. So even a query that forgets its WHERE clause cannot read or write
 * another organization's rows. Both settings are transaction-local (they reset on
 * commit/rollback), so pooled connections never leak a tenant.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = PgDatabase<PgQueryResultHKT, any>;

export async function withTenant<DB extends AnyDb, T>(
  database: DB,
  orgId: string,
  fn: (tx: Parameters<Parameters<DB["transaction"]>[0]>[0]) => Promise<T>,
): Promise<T> {
  if (!orgId) throw new Error("withTenant: orgId is required");
  return database.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.org_id', ${orgId}, true)`);
    await tx.execute(sql`set local role app_rls`);
    return fn(tx as Parameters<Parameters<DB["transaction"]>[0]>[0]);
  });
}
