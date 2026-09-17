import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/cloudflare-worker/test/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 20_000
  }
});
