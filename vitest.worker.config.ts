import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./apps/cloudflare-worker/wrangler.jsonc" },
    }),
  ],
  test: {
    include: ["apps/cloudflare-worker/test-runtime/**/*.worker.test.ts"],
  },
});
