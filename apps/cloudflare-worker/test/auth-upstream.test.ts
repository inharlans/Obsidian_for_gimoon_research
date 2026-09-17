import { describe, expect, it, vi } from "vitest";
import {
  githubAuthorizationScopes,
  githubOAuthConfigurationReady,
  revokeGitHubTokenBestEffort,
} from "../src/github-oauth.js";
import type { Env } from "../src/types.js";

describe("GitHub upstream OAuth minimization", () => {
  it("requests no additional GitHub scope for the configured login allowlist", () => {
    expect(githubAuthorizationScopes({ OWNER_GITHUB_LOGIN: "owner", OWNER_EMAIL: undefined })).toEqual([]);
    expect(githubAuthorizationScopes({ OWNER_GITHUB_LOGIN: undefined, OWNER_EMAIL: "owner@example.com" })).toEqual(["user:email"]);
  });

  it("reports GitHub OAuth ready only when credentials and an owner allowlist are configured", () => {
    expect(githubOAuthConfigurationReady({
      GITHUB_CLIENT_ID: "client-id",
      GITHUB_CLIENT_SECRET: "client-secret",
      OWNER_GITHUB_LOGIN: "owner",
    })).toBe(true);
    expect(githubOAuthConfigurationReady({
      GITHUB_CLIENT_ID: "client-id",
      GITHUB_CLIENT_SECRET: "SET_GITHUB_CLIENT_SECRET",
      OWNER_GITHUB_LOGIN: "owner",
    })).toBe(false);
    expect(githubOAuthConfigurationReady({
      GITHUB_CLIENT_ID: "client-id",
      GITHUB_CLIENT_SECRET: "client-secret",
    })).toBe(false);
  });

  it("revokes the short-lived upstream token without exposing it in the URL", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
    const env = {
      GITHUB_CLIENT_ID: "client-id",
      GITHUB_CLIENT_SECRET: "client-secret",
    } as Pick<Env, "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET">;

    await expect(revokeGitHubTokenBestEffort(env, "temporary-upstream-token", fetchImpl)).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(String(url)).toBe("https://api.github.com/applications/client-id/token");
    expect(String(url)).not.toContain("temporary-upstream-token");
    expect(init?.method).toBe("DELETE");
    expect(init?.body).toBe(JSON.stringify({ access_token: "temporary-upstream-token" }));
  });
});
