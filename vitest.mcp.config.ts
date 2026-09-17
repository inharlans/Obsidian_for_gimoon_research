import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/mcp/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000
  }
});
