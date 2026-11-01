import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
    // server-only throws outside of Next's bundler; stub it for tests.
    alias: { "server-only": path.resolve(__dirname, "tests/server-only-stub.ts") },
  },
});
