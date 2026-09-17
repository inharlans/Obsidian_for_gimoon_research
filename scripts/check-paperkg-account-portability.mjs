const configuredBaseUrl =
  process.env.PAPERKG_REMOTE_BASE_URL ?? "https://paperkg-remote.nhtgb021030.workers.dev";
const baseUrl = configuredBaseUrl.replace(/\/$/, "");
const resource = `${baseUrl}/mcp`;

async function json(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

const [health, authorization, protectedResource] = await Promise.all([
  json(`${baseUrl}/health`),
  json(`${baseUrl}/.well-known/oauth-authorization-server`),
  json(`${baseUrl}/.well-known/oauth-protected-resource/mcp`),
]);

const unauthorized = await fetch(resource, {
  method: "POST",
  headers: {
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "account-portability-check",
    method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "account-portability-check", version: "1.0.0" } },
  }),
});

const checks = {
  health: health.ok === true && health.oauthRecovery === "ready" && health.githubOAuth === "ready",
  canonicalResource: protectedResource.resource === resource,
  authorizationServer: Array.isArray(protectedResource.authorization_servers) && protectedResource.authorization_servers.includes(baseUrl),
  dynamicClientRegistration: authorization.registration_endpoint === `${baseUrl}/oauth/register`,
  clientMetadataDocuments: authorization.client_id_metadata_document_supported === true,
  authorizationCode: Array.isArray(authorization.grant_types_supported) && authorization.grant_types_supported.includes("authorization_code"),
  refreshTokens: Array.isArray(authorization.grant_types_supported) && authorization.grant_types_supported.includes("refresh_token"),
  publicClientExchange: Array.isArray(authorization.token_endpoint_auth_methods_supported) && authorization.token_endpoint_auth_methods_supported.includes("none"),
  pkceS256: Array.isArray(authorization.code_challenge_methods_supported) && authorization.code_challenge_methods_supported.includes("S256"),
  oauthChallenge: unauthorized.status === 401 && (unauthorized.headers.get("www-authenticate") ?? "").includes("oauth-protected-resource"),
};

const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
const report = {
  accountSwitchReady: failed.length === 0,
  identityBoundary: "The ChatGPT account owns only its connector client and tokens; PaperKG ownership is verified by the allowlisted GitHub identity.",
  expectedNewAccountFlow: "Create a new app connection, then approve OAuth with the same allowlisted GitHub account.",
  canonicalMcp: resource,
  authBuild: health.authBuild,
  checks,
  failed,
  performedWrites: false,
};

console.log(JSON.stringify(report, null, 2));
if (failed.length > 0) process.exitCode = 1;
