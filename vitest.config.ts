import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    exclude: ["apps/cloudflare-worker/test-runtime/**"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000
  }
});
