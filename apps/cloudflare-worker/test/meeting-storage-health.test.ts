import { describe, expect, it, vi } from "vitest";
import { meetingStorageHealth } from "../src/meeting.js";
import type { Env } from "../src/types.js";

function healthEnvironment(result: { stale_count: number } | null, failure?: Error): Pick<Env, "PAPERKG_DB"> {
  const statement = {
    bind: vi.fn(function (this: typeof statement) { return this; }),
    first: vi.fn(async () => {
      if (failure) throw failure;
      return result;
    }),
  };
  const session = { prepare: vi.fn(() => statement) };
  return {
    PAPERKG_DB: {
      withSession: vi.fn((constraint: string) => {
        expect(constraint).toBe("first-primary");
        return session;
      }),
    } as unknown as D1Database,
  };
}

describe("meeting storage health", () => {
  it("reports ready only when no unfinished receipt is stale", async () => {
    await expect(meetingStorageHealth(
      healthEnvironment({ stale_count: 0 }),
      Date.parse("2026-08-12T00:00:00.000Z"),
    )).resolves.toBe("ready");
  });

  it("reports backlog without exposing receipt details", async () => {
    await expect(meetingStorageHealth(
      healthEnvironment({ stale_count: 2 }),
      Date.parse("2026-08-12T00:00:00.000Z"),
    )).resolves.toBe("backlog");
  });

  it("degrades to unavailable when D1 cannot answer", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(meetingStorageHealth(
      healthEnvironment(null, new TypeError("temporary D1 failure")),
      Date.parse("2026-08-12T00:00:00.000Z"),
    )).resolves.toBe("unavailable");
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('"phase":"health_check"'));
    expect(errorLog).not.toHaveBeenCalledWith(expect.stringContaining("temporary D1 failure"));
    errorLog.mockRestore();
  });
});
