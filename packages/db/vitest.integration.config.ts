import { defineConfig } from "vitest/config";

// Integration tests start a real Postgres in Docker via Testcontainers.
export default defineConfig({
  test: {
    include: ["src/**/*.int.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
