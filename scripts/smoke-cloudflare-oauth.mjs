import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://paperkg-remote.nhtgb021030.workers.dev";
const resource = `${baseUrl}/mcp`;
const state = randomBytes(24).toString("base64url");
const verifier = randomBytes(48).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const urlFile = path.resolve(".paperkg/cloudflare/oauth-smoke-url.txt");

function parseMcpPayload(text, contentType) {
  if (contentType.includes("application/json")) return JSON.parse(text);
  const data = text.split(/\r?\n/).filter((line) => line.startsWith("data:"));
  if (!data.length) throw new Error(`Unexpected MCP response: ${text.slice(0, 500)}`);
  return JSON.parse(data.at(-1).slice(5).trim());
}

async function mcpRequest(token, message, protocolVersion) {
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  };
  if (protocolVersion) headers["mcp-protocol-version"] = protocolVersion;
  const response = await fetch(resource, { method: "POST", headers, body: JSON.stringify(message) });
  const text = await response.text();
  if (!response.ok) throw new Error(`MCP ${response.status}: ${text.slice(0, 500)}`);
  return parseMcpPayload(text, response.headers.get("content-type") ?? "");
}

let settleAuthorization;
let rejectAuthorization;
const authorizationCodePromise = new Promise((resolve, reject) => {
  settleAuthorization = resolve;
  rejectAuthorization = reject;
});

let redirectUri;
const server = createServer((request, response) => {
  const url = new URL(request.url, redirectUri);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (url.searchParams.get("state") !== state) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" }).end("OAuth state mismatch");
    rejectAuthorization(new Error("OAuth state mismatch"));
    return;
  }
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  if (error || !code) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" }).end(`OAuth failed: ${error ?? "missing code"}`);
    rejectAuthorization(new Error(`OAuth failed: ${error ?? "missing code"}`));
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end("<h1>PaperKG OAuth complete</h1><p>You may close this window.</p>");
  settleAuthorization(code);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not allocate a local OAuth callback port");
redirectUri = `http://127.0.0.1:${address.port}/callback`;

try {
  const metadataResponse = await fetch(`${baseUrl}/.well-known/oauth-authorization-server`);
  if (!metadataResponse.ok) {
    throw new Error(`OAuth metadata discovery failed: ${metadataResponse.status} ${await metadataResponse.text()}`);
  }
  const metadata = await metadataResponse.json();
  if (!metadata.revocation_endpoint) throw new Error("OAuth metadata omitted revocation_endpoint");

  const registrationResponse = await fetch(`${baseUrl}/oauth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_name: "PaperKG local OAuth smoke test",
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    }),
  });
  if (!registrationResponse.ok) throw new Error(`DCR failed: ${registrationResponse.status} ${await registrationResponse.text()}`);
  const client = await registrationResponse.json();

  const authorizationUrl = new URL(`${baseUrl}/authorize`);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", client.client_id);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("resource", resource);
  authorizationUrl.searchParams.set("scope", "paperkg.read paperkg.evidence.read paperkg.meeting.submit");

  console.log("OPEN_THIS_URL");
  console.log(authorizationUrl.toString());
  console.log(`Waiting for the browser OAuth callback on ${redirectUri} ...`);
  await mkdir(path.dirname(urlFile), { recursive: true });
  await writeFile(urlFile, `${authorizationUrl.toString()}\n`, "utf8");

  const timeout = setTimeout(() => rejectAuthorization(new Error("OAuth callback timed out after ten minutes")), 600_000);
  const authorizationCode = await authorizationCodePromise.finally(() => clearTimeout(timeout));
  await rm(urlFile, { force: true });

  const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: client.client_id,
      code: authorizationCode,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      resource,
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Token exchange failed: ${tokenResponse.status} ${await tokenResponse.text()}`);
  const token = await tokenResponse.json();
  if (!token.access_token) throw new Error("Token response omitted access_token");

  const initialize = await mcpRequest(token.access_token, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "paperkg-smoke", version: "1.0.0" } },
  });
  const protocolVersion = initialize.result?.protocolVersion;
  if (!protocolVersion) throw new Error(`Initialize failed: ${JSON.stringify(initialize)}`);

  const tools = await mcpRequest(token.access_token, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, protocolVersion);
  const toolNames = tools.result?.tools?.map((item) => item.name) ?? [];
  if (!toolNames.includes("search") || !toolNames.includes("get_paper")) throw new Error(`Expected tools missing: ${toolNames.join(", ")}`);

  const searchResult = await mcpRequest(token.access_token, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "search", arguments: { query: "A-MEM" } },
  }, protocolVersion);
  const searchText = searchResult.result?.content?.find((item) => item.type === "text")?.text ?? "";
  if (!searchText.toLocaleLowerCase().includes("a-mem")) throw new Error(`A-MEM search did not return an expected result: ${searchText.slice(0, 500)}`);

  const revocationResponse = await fetch(metadata.revocation_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: token.access_token,
      token_type_hint: "access_token",
      client_id: client.client_id,
    }),
  });
  if (!revocationResponse.ok) {
    throw new Error(`Token revocation failed: ${revocationResponse.status} ${await revocationResponse.text()}`);
  }

  const revokedTokenCheck = await fetch(resource, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.access_token}`,
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": protocolVersion,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/list", params: {} }),
  });
  if (revokedTokenCheck.status !== 401) {
    throw new Error(`Revoked access token was not rejected: ${revokedTokenCheck.status} ${await revokedTokenCheck.text()}`);
  }

  console.log(JSON.stringify({
    oauth: "ok",
    protocolVersion,
    toolCount: toolNames.length,
    requiredTools: ["search", "fetch", "get_paper", "compare_papers"].filter((name) => toolNames.includes(name)),
    aMemSearch: "ok",
    accessTokenRevocation: "ok",
    tokenPrinted: false,
  }, null, 2));
} finally {
  server.close();
  await rm(urlFile, { force: true });
}
