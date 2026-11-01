-- Row-level security for tenant tables.
-- Pattern for every tenant-owned table (copy for new tables):
--   1. table has org_id text NOT NULL REFERENCES organization(id)
--   2. ENABLE + FORCE row level security
--   3. policy: org_id = current_setting('app.org_id', true)
--   4. GRANT table privileges to app_rls
-- The app switches to role app_rls inside withTenant() (src/db/tenant.ts).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_rls') THEN
    CREATE ROLE app_rls NOLOGIN NOBYPASSRLS;
  END IF;
END
$$;
--> statement-breakpoint
GRANT app_rls TO CURRENT_USER;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO app_rls;
--> statement-breakpoint

ALTER TABLE "project" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "project" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "project_tenant_isolation" ON "project"
  AS PERMISSIVE FOR ALL TO app_rls
  USING (org_id = current_setting('app.org_id', true))
  WITH CHECK (org_id = current_setting('app.org_id', true));
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "project" TO app_rls;
