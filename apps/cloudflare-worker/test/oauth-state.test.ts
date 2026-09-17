import { describe, expect, it } from "vitest";
import {
  consumeOAuthTransientState,
  purgeExpiredOAuthTransientState,
  putOAuthTransientState,
  recordOAuthCallbackEvent,
  recordOAuthCallbackEventBestEffort,
} from "../src/oauth-state.js";
import type { Env } from "../src/types.js";

interface StoredState {
  payload: string;
  createdAtMs: number;
  expiresAtMs: number;
}

interface FakeStatement {
  sql: string;
  values: unknown[];
  bind(...values: unknown[]): FakeStatement;
  run(): Promise<{ success: true; results: unknown[] }>;
}

function fakeD1() {
  const rows = new Map<string, StoredState>();
  const callbackEvents: Array<{ fingerprint: string; phase: string; outcome: string; createdAtMs: number }> = [];

  const database = {
    prepare(sql: string): FakeStatement {
      const statement: FakeStatement = {
        sql,
        values: [],
        bind(...values: unknown[]) {
          statement.values = values;
          return statement;
        },
        async run() {
          if (sql.includes("INSERT INTO oauth_transient_states")) {
            const [key, payload, createdAtMs, expiresAtMs] = statement.values as [string, string, number, number];
            rows.set(key, { payload, createdAtMs, expiresAtMs });
            return { success: true, results: [] };
          }
          if (sql.includes("DELETE FROM oauth_transient_states") && sql.includes("RETURNING payload")) {
            const [key] = statement.values as [string];
            const row = rows.get(key);
            rows.delete(key);
            return {
              success: true,
              results: row ? [{ payload: row.payload, expires_at_ms: row.expiresAtMs }] : [],
            };
          }
          if (sql.includes("DELETE FROM oauth_transient_states") && sql.includes("expires_at_ms <= ?")) {
            const [nowMs] = statement.values as [number];
            for (const [key, value] of rows) {
              if (value.expiresAtMs <= nowMs) rows.delete(key);
            }
            return { success: true, results: [] };
          }
          if (sql.includes("INSERT INTO oauth_callback_events")) {
            const [fingerprint, phase, outcome, createdAtMs] = statement.values as [string, string, string, number];
            callbackEvents.push({ fingerprint, phase, outcome, createdAtMs });
            return { success: true, results: [] };
          }
          if (sql.includes("DELETE FROM oauth_callback_events")) {
            const [cutoff] = statement.values as [number];
            for (let index = callbackEvents.length - 1; index >= 0; index -= 1) {
              if (callbackEvents[index]!.createdAtMs <= cutoff) callbackEvents.splice(index, 1);
            }
            return { success: true, results: [] };
          }
          if (sql.includes("DELETE FROM oauth_reissue_authorizations")) {
            return { success: true, results: [] };
          }
          throw new Error(`Unexpected D1 run query: ${sql}`);
        },
      };
      return statement;
    },
  };

  return {
    env: { PAPERKG_DB: database } as unknown as Pick<Env, "PAPERKG_DB">,
    rows,
    callbackEvents,
  };
}

describe("D1-backed OAuth transient state", () => {
  it("does not let optional callback auditing fail the OAuth flow", async () => {
    const env = {
      PAPERKG_DB: {
        prepare() {
          throw new Error("audit unavailable");
        },
      },
    } as unknown as Pick<Env, "PAPERKG_DB">;

    await expect(recordOAuthCallbackEventBestEffort(env, "fingerprint", "received", "ok"))
      .resolves.toBe(false);
  });

  it("atomically consumes a valid consent state exactly once", async () => {
    const { env, rows } = fakeD1();
    await putOAuthTransientState(env, "consent", "consent-1", "payload", 600, 1_000);

    expect(await consumeOAuthTransientState(env, "consent", "consent-1", 2_000)).toBe("payload");
    expect(await consumeOAuthTransientState(env, "consent", "consent-1", 2_000)).toBeNull();
    expect(rows.size).toBe(0);
  });

  it("consumes but rejects expired state and keeps consent/upstream namespaces separate", async () => {
    const { env } = fakeD1();
    await putOAuthTransientState(env, "consent", "same-id", "expired", 1, 1_000);
    await putOAuthTransientState(env, "upstream", "same-id", "valid", 600, 1_000);

    expect(await consumeOAuthTransientState(env, "consent", "same-id", 2_001)).toBeNull();
    expect(await consumeOAuthTransientState(env, "upstream", "same-id", 2_001)).toBe("valid");
  });

  it("purges abandoned expired rows without removing live rows", async () => {
    const { env, rows, callbackEvents } = fakeD1();
    await putOAuthTransientState(env, "consent", "expired", "one", 1, 1_000);
    await putOAuthTransientState(env, "consent", "live", "two", 600, 1_000);
    await recordOAuthCallbackEvent(env, "old", "received", "ok", 1_000);
    await recordOAuthCallbackEvent(env, "live", "received", "ok", 2_001);

    await purgeExpiredOAuthTransientState(env, 24 * 60 * 60 * 1_000 + 2_000);

    expect(rows.has("paperkg:consent:expired")).toBe(false);
    expect(rows.has("paperkg:consent:live")).toBe(false);
    expect(callbackEvents).toEqual([{ fingerprint: "live", phase: "received", outcome: "ok", createdAtMs: 2_001 }]);
  });
});
