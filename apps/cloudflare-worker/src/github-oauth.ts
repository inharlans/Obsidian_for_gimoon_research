import type { Env } from "./types.js";

function configured(value: string | undefined): boolean {
  const normalized = value?.trim();
  return Boolean(normalized && !normalized.startsWith("SET_"));
}

export function githubOAuthConfigurationReady(
  env: Pick<Env, "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET" | "OWNER_GITHUB_LOGIN" | "OWNER_EMAIL">,
): boolean {
  const ownerConfigured = configured(env.OWNER_GITHUB_LOGIN) || configured(env.OWNER_EMAIL);
  return configured(env.GITHUB_CLIENT_ID) && configured(env.GITHUB_CLIENT_SECRET) && ownerConfigured;
}

export function githubAuthorizationScopes(
  env: Pick<Env, "OWNER_GITHUB_LOGIN" | "OWNER_EMAIL">,
): string[] {
  return !configured(env.OWNER_GITHUB_LOGIN) && configured(env.OWNER_EMAIL)
    ? ["user:email"]
    : [];
}

export async function revokeGitHubTokenBestEffort(
  env: Pick<Env, "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET">,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImpl(`https://api.github.com/applications/${encodeURIComponent(env.GITHUB_CLIENT_ID)}/token`, {
      method: "DELETE",
      signal: AbortSignal.timeout(5_000),
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Basic ${btoa(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`)}`,
        "content-type": "application/json",
        "user-agent": "PaperKG-Remote-MCP",
        "x-github-api-version": "2026-03-10",
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (response.status === 204) return true;
    console.error(JSON.stringify({ event: "github_upstream_token_revoke_failure", status: response.status }));
    return false;
  } catch (error) {
    console.error(JSON.stringify({
      event: "github_upstream_token_revoke_failure",
      error_name: error instanceof Error ? error.name : "unknown",
    }));
    return false;
  }
}
