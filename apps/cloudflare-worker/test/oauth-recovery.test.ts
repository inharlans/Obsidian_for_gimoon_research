import { describe, expect, it } from "vitest";
import {
  consumeCompletedOAuthRedirect,
  oauthRecoveryConfigurationReady,
  purgeExpiredCompletedOAuthRedirects,
  storeCompletedOAuthRedirect,
  storeCompletedOAuthRedirectBestEffort,
} from "../src/oauth-recovery.js";
import type { Env } from "../src/types.js";

interface StoredRedirect {
  encryptedRedirect: string;
  iv: string;
  createdAtMs: number;
  expiresAtMs: number;
}

function fakeBindings() {
  const rows = new Map<string, StoredRedirect>();
  const database = {
    prepare(sql: string) {
      let values: unknown[] = [];
      const statement = {
        bind(...input: unknown[]) {
          values = input;
          return statement;
        },
        async run() {
          if (sql.includes("INSERT INTO oauth_completed_redirects")) {
            const [binding, encryptedRedirect, iv, createdAtMs, expiresAtMs] = values as [string, string, string, number, number];
            rows.set(binding, { encryptedRedirect, iv, createdAtMs, expiresAtMs });
            return { success: true, results: [] };
          }
          if (sql.includes("RETURNING encrypted_redirect")) {
            const [binding] = values as [string];
            const row = rows.get(binding);
            rows.delete(binding);
            return {
              success: true,
              results: row ? [{
                encrypted_redirect: row.encryptedRedirect,
                iv: row.iv,
                expires_at_ms: row.expiresAtMs,
              }] : [],
            };
          }
          if (sql.includes("DELETE FROM oauth_completed_redirects")) {
            const [cutoff] = values as [number];
            for (const [binding, row] of rows) {
              if (row.expiresAtMs <= cutoff) rows.delete(binding);
            }
            return { success: true, results: [] };
          }
          throw new Error(`Unexpected D1 query: ${sql}`);
        },
      };
      return statement;
    },
  };
  const env = {
    PAPERKG_DB: database,
    OAUTH_RECOVERY_KEY: Buffer.from(Uint8Array.from({ length: 32 }, (_, index) => index)).toString("base64url"),
  } as unknown as Pick<Env, "PAPERKG_DB" | "OAUTH_RECOVERY_KEY">;
  return { env, rows };
}

describe("completed OAuth redirect recovery", () => {
  it("accepts shell-delivered base64url secrets with surrounding whitespace", async () => {
    const { env } = fakeBindings();
    env.OAUTH_RECOVERY_KEY = `\ufeff${env.OAUTH_RECOVERY_KEY}\r\n`;
    expect(await oauthRecoveryConfigurationReady(env)).toBe(true);
  });

  it("encrypts the exact redirect and consumes it once", async () => {
    const { env, rows } = fakeBindings();
    const redirect = "http://127.0.0.1:54870/api/connectors/paperkg/oauth/callback?code=secret&state=state";
    await storeCompletedOAuthRedirect(env, "binding", redirect, 600, 1_000);

    expect(rows.get("binding")?.encryptedRedirect).not.toContain("127.0.0.1");
    expect(await consumeCompletedOAuthRedirect(env, "binding", 2_000)).toBe(redirect);
    expect(await consumeCompletedOAuthRedirect(env, "binding", 2_000)).toBeNull();
  });

  it("does not fail authorization after the provider has minted a code when recovery storage is down", async () => {
    const { env } = fakeBindings();
    env.PAPERKG_DB = {
      prepare() {
        throw new Error("recovery database unavailable");
      },
    } as unknown as D1Database;
    await expect(storeCompletedOAuthRedirectBestEffort(
      env,
      "binding",
      "http://127.0.0.1:63424/api/connectors/paperkg/oauth/callback?code=secret&state=state",
      600,
    )).resolves.toBe(false);
  });

  it("rejects expired redirects and purges abandoned records", async () => {
    const { env, rows } = fakeBindings();
    await storeCompletedOAuthRedirect(env, "expired", "http://127.0.0.1:1/callback", 1, 1_000);
    expect(await consumeCompletedOAuthRedirect(env, "expired", 2_001)).toBeNull();

    await storeCompletedOAuthRedirect(env, "abandoned", "http://127.0.0.1:2/callback", 1, 1_000);
    await purgeExpiredCompletedOAuthRedirects(env, 2_001);
    expect(rows.size).toBe(0);
  });
});
