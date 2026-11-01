// Deterministic env for tests (no real secrets, no network).
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-0000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.POLAR_PRODUCT_PRO_MONTHLY = "prod_pro_monthly";
process.env.POLAR_PRODUCT_PRO_YEARLY = "prod_pro_yearly";
process.env.POLAR_PRODUCT_LIFETIME = "prod_lifetime";
