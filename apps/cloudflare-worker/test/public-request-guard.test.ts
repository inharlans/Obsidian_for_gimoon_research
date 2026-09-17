import { describe, expect, it, vi } from "vitest";
import { guardPublicRequest } from "../src/public-request-guard.js";
import type { Env } from "../src/types.js";

type GuardEnv = Pick<Env, "OAUTH_FLOW_RATE_LIMITER" | "OAUTH_REGISTRATION_RATE_LIMITER">;

function guardEnv(options: {
  flow?: () => Promise<RateLimitOutcome>;
  registration?: () => Promise<RateLimitOutcome>;
} = {}): GuardEnv {
  return {
    OAUTH_FLOW_RATE_LIMITER: {
      limit: vi.fn(options.flow ?? (async () => ({ success: true }))),
    },
    OAUTH_REGISTRATION_RATE_LIMITER: {
      limit: vi.fn(options.registration ?? (async () => ({ success: true }))),
    },
  };
}

describe("public request guard", () => {
  it("preserves an allowed OAuth body after bounded streaming inspection", async () => {
    const env = guardEnv();
    const original = JSON.stringify({ redirect_uris: ["http://127.0.0.1:8765/callback"] });
    const guarded = await guardPublicRequest(new Request("https://paperkg.example/oauth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: original,
    }), env);

    expect(guarded).toBeInstanceOf(Request);
    expect(await (guarded as Request).text()).toBe(original);
    expect(env.OAUTH_REGISTRATION_RATE_LIMITER.limit).toHaveBeenCalledWith({ key: "oauth-register" });
  });

  it("rejects an oversized chunked OAuth body before provider parsing", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(64 * 1_024));
        controller.enqueue(new Uint8Array([1]));
        controller.close();
      },
    });
    const request = new Request("https://paperkg.example/oauth/token", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    const guarded = await guardPublicRequest(request, guardEnv());

    expect(guarded).toBeInstanceOf(Response);
    expect((guarded as Response).status).toBe(413);
    expect((guarded as Response).headers.get("cache-control")).toBe("no-store");
  });

  it("returns a non-cacheable 429 when public DCR exceeds its bounded rate", async () => {
    const env = guardEnv({ registration: async () => ({ success: false }) });
    const guarded = await guardPublicRequest(new Request("https://paperkg.example/oauth/register", {
      method: "POST",
      body: "{}",
    }), env);

    expect(guarded).toBeInstanceOf(Response);
    expect((guarded as Response).status).toBe(429);
    expect((guarded as Response).headers.get("retry-after")).toBe("60");
    expect((guarded as Response).headers.get("cache-control")).toBe("no-store");
  });

  it("fails closed without exposing a rate-limit binding error", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const env = guardEnv({ flow: async () => { throw new TypeError("private binding detail"); } });
    const guarded = await guardPublicRequest(new Request("https://paperkg.example/authorize", {
      method: "POST",
      body: "approve=1",
    }), env);

    expect(guarded).toBeInstanceOf(Response);
    expect((guarded as Response).status).toBe(503);
    expect((guarded as Response).headers.get("retry-after")).toBe("5");
    expect(await (guarded as Response).text()).not.toContain("private binding detail");
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('"error_name":"TypeError"'));
    expect(errorLog).not.toHaveBeenCalledWith(expect.stringContaining("private binding detail"));
    errorLog.mockRestore();
  });
});
