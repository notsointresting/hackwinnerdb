import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The first test to touch the dataset parses the whole YAML corpus, which
    // takes well over the 5s default on a cold run.
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws by design outside a server bundle; the modules that
      // import it are plain functions here, so stub it rather than skip them.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
