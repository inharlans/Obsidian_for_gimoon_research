import type { AuthRequest } from "@cloudflare/workers-oauth-provider";
import { z } from "zod";
import type { AuthProps, Env } from "./types.js";

const inputSchema = z.object({
  state: z.string().min(32).max(512),
  client_id: z.string().min(8).max(512),
  code_challenge: z.string().min(43).max(128),
  code_challenge_method: z.literal("S256"),
  redirect_uri: z.url(),
  resource: z.url(),
  scope: z.string().min(1).max(512),
});

type ReissueInput = z.infer<typeof inputSchema>;

interface RecoverableGrant {
  id: string;
  clientId: string;
  userId: string;
  scope: string[];
  metadata?: { login?: string };
  createdAt: number;
  authCodeId?: string;
  authCodeWrappedKey?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  resource?: string;
  redirectUri?: string;
}

function canonicalRequest(input: ReissueInput): string {
  return JSON.stringify([
    input.state,
    input.client_id,
    input.code_challenge,
    input.code_challenge_method,
    input.redirect_uri,
    input.resource,
    input.scope,
  ]);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function oauthReissueRequestHash(value: unknown): Promise<string> {
  return sha256(canonicalRequest(inputSchema.parse(value)));
}

function exactLoopbackRedirect(value: string): boolean {
  const url = new URL(value);
  return url.protocol === "http:"
    && url.hostname === "127.0.0.1"
    && Boolean(url.port)
    && url.pathname === "/api/connectors/paperkg/oauth/callback"
    && !url.search
    && !url.hash;
}

async function consumeOperatorAuthorization(env: Env, requestHash: string): Promise<boolean> {
  const result = await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_reissue_authorizations
    WHERE request_hash = ? AND expires_at_ms > ?
    RETURNING request_hash
  `).bind(requestHash, Date.now()).run();
  return result.results.length === 1;
}

async function findMatchingGrant(env: Env, input: ReissueInput): Promise<RecoverableGrant | null> {
  let cursor: string | undefined;
  do {
    const page = await env.OAUTH_KV.list(cursor
      ? { prefix: "grant:", limit: 1000, cursor }
      : { prefix: "grant:", limit: 1000 });
    for (const key of page.keys) {
      const grant = await env.OAUTH_KV.get<RecoverableGrant>(key.name, { type: "json" });
      if (!grant) continue;
      if (grant.clientId !== input.client_id || grant.redirectUri !== input.redirect_uri) continue;
      if (grant.codeChallenge !== input.code_challenge || grant.codeChallengeMethod !== "S256") continue;
      if (grant.resource !== input.resource || !grant.authCodeId || !grant.authCodeWrappedKey) continue;
      if (Date.now() / 1_000 - grant.createdAt > 600) continue;
      if (grant.scope.join(" ") !== input.scope) continue;
      return grant;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return null;
}

export async function handleOAuthLoopbackReissue(request: Request, env: Env): Promise<Response> {
  let input: ReissueInput;
  try {
    input = inputSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid_recovery_request" }, { status: 400 });
  }
  if (!exactLoopbackRedirect(input.redirect_uri)) {
    return Response.json({ error: "invalid_loopback_redirect" }, { status: 400 });
  }
  const expectedResource = `${env.PUBLIC_BASE_URL.replace(/\/$/, "")}/mcp`;
  if (input.resource !== expectedResource || input.scope !== "paperkg.meeting.submit") {
    return Response.json({ error: "invalid_recovery_scope" }, { status: 400 });
  }
  const client = await env.OAUTH_PROVIDER.lookupClient(input.client_id);
  if (!client?.redirectUris.includes(input.redirect_uri)) {
    return Response.json({ error: "unregistered_recovery_redirect" }, { status: 400 });
  }
  const requestHash = await oauthReissueRequestHash(input);
  if (!await consumeOperatorAuthorization(env, requestHash)) {
    return Response.json({ error: "recovery_not_authorized_or_used" }, { status: 403 });
  }
  const grant = await findMatchingGrant(env, input);
  const login = grant?.metadata?.login;
  if (!grant || !login || login.toLocaleLowerCase() !== env.OWNER_GITHUB_LOGIN.toLocaleLowerCase()) {
    return Response.json({ error: "recoverable_grant_not_found" }, { status: 410 });
  }
  const authRequest: AuthRequest = {
    responseType: "code",
    clientId: input.client_id,
    redirectUri: input.redirect_uri,
    scope: ["paperkg.meeting.submit"],
    state: input.state,
    codeChallenge: input.code_challenge,
    codeChallengeMethod: "S256",
    resource: input.resource,
  };
  const props: AuthProps = {
    userId: grant.userId,
    login,
    scopes: ["paperkg.meeting.submit"],
  };
  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: authRequest,
    userId: grant.userId,
    metadata: { login },
    scope: ["paperkg.meeting.submit"],
    props,
  });
  return new Response(null, {
    status: 303,
    headers: { location: redirectTo, "cache-control": "no-store" },
  });
}
