import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/core/**/*.test.ts",
      "packages/indexer/**/*.test.ts",
      "packages/ingestion/**/*.test.ts",
      "scripts/**/*.test.ts"
    ],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000
  }
});
