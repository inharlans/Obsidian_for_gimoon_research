import {
  AuthorizationError,
  type AuthRequest,
  type ClientInfo,
} from "@cloudflare/workers-oauth-provider";
import {
  authHeaders,
  clearBrowserAuthCookies,
  clearCookie,
  CSRF_COOKIE,
  requestCookie,
  secureCookie,
  STATE_COOKIE,
  terminalAuthResponse,
} from "./auth-cookies.js";
import { CONSENT_CSP } from "./auth-policy.js";
import {
  githubAuthorizationScopes,
  githubOAuthConfigurationReady,
  revokeGitHubTokenBestEffort,
} from "./github-oauth.js";
import {
  consumeCompletedOAuthRedirect,
  oauthRecoveryConfigurationReady,
  storeCompletedOAuthRedirectBestEffort,
} from "./oauth-recovery.js";
import { handleOAuthLoopbackReissue } from "./oauth-reissue.js";
import {
  consumeOAuthTransientState,
  putOAuthTransientState,
  recordOAuthCallbackEventBestEffort,
} from "./oauth-state.js";
import { meetingStorageHealth } from "./meeting.js";
import type { AuthProps, Env } from "./types.js";

const TEN_MINUTES = 600;
const AUTH_BUILD_ID = "meeting-graph-quality-v18";
export const PAPERKG_SCOPES = [
  "paperkg.read",
  "paperkg.evidence.read",
  "paperkg.meeting.submit",
] as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function hash(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

async function resumeCompletedAuthorization(env: Env, browserBindingHash: string | undefined): Promise<Response | null> {
  if (!browserBindingHash) return null;
  const redirectTo = await consumeCompletedOAuthRedirect(env, browserBindingHash);
  if (!redirectTo) return null;
  return terminalAuthResponse(null, 303, { location: redirectTo });
}

function oauthErrorResponse(error: AuthorizationError): Response {
  if (!error.redirectUri) return terminalAuthResponse(error.description, 400);
  const redirect = new URL(error.redirectUri);
  redirect.searchParams.set("error", error.code);
  redirect.searchParams.set("error_description", error.description);
  if (error.state) redirect.searchParams.set("state", error.state);
  if (error.issuer) redirect.searchParams.set("iss", error.issuer);
  return terminalAuthResponse(null, 302, { location: redirect.toString() });
}

function renderConsent(client: ClientInfo | null, oauthRequest: AuthRequest, consentId: string, csrf: string): Response {
  const clientName = escapeHtml(client?.clientName ?? "알 수 없는 MCP 클라이언트");
  const requested = oauthRequest.scope.length
    ? oauthRequest.scope.map((scope) => `<li><code>${escapeHtml(scope)}</code></li>`).join("")
    : "<li>요청된 추가 권한 없음</li>";
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PaperKG 연결 승인</title><style>
body{font-family:system-ui,sans-serif;background:#f6f7f9;color:#17202a;margin:0}.card{max-width:620px;margin:8vh auto;background:white;padding:32px;border-radius:16px;box-shadow:0 14px 45px #0002}h1{font-size:24px}.client{padding:16px;background:#f1f5f9;border-radius:10px}button{border:0;border-radius:9px;padding:12px 18px;background:#1769e0;color:white;font-weight:700;cursor:pointer}.note{color:#59636e;font-size:14px}code{font-size:13px}</style></head>
<body><main class="card"><h1>PaperKG 연결 승인</h1><p class="client"><strong>${clientName}</strong>에서 개인 PaperKG에 접근하려고 합니다.</p>
<p>요청 권한:</p><ul>${requested}</ul><p class="note">로그인은 GitHub에서 처리됩니다. 서버는 GitHub 비밀번호를 보지 않으며, 허용된 소유자 계정만 통과합니다. 원격 MCP는 정본 vault를 수정할 수 없습니다.</p>
<form method="post" action="/authorize"><input type="hidden" name="consent_id" value="${escapeHtml(consentId)}"><input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}"><button type="submit">GitHub로 로그인하고 승인</button></form></main></body></html>`;
  return new Response(html, {
    headers: authHeaders({
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": CONSENT_CSP,
      "x-frame-options": "DENY",
      "x-paperkg-auth-build": AUTH_BUILD_ID,
      "cache-control": "no-store",
    }, [secureCookie(CSRF_COOKIE, csrf), clearCookie(STATE_COOKIE)]),
  });
}

async function startGitHubAuthorization(request: Request, env: Env, oauthRequest: AuthRequest): Promise<Response> {
  const state = crypto.randomUUID();
  await putOAuthTransientState(env, "upstream", state, JSON.stringify(oauthRequest), TEN_MINUTES);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", new URL("/callback", request.url).toString());
  const scopes = githubAuthorizationScopes(env);
  if (scopes.length) authorize.searchParams.set("scope", scopes.join(" "));
  authorize.searchParams.set("state", state);
  return new Response(null, {
    status: 303,
    headers: authHeaders({
      location: authorize.toString(),
      "cache-control": "no-store",
      "x-paperkg-auth-build": AUTH_BUILD_ID,
    }, [secureCookie(STATE_COOKIE, await hash(state)), clearCookie(CSRF_COOKIE)]),
  });
}

async function exchangeGitHubCode(request: Request, env: Env, code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "user-agent": "PaperKG-Remote-MCP" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL("/callback", request.url).toString(),
    }),
  });
  const payload = await response.json<{ access_token?: string; error_description?: string }>();
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? "GitHub token exchange failed");
  return payload.access_token;
}

interface GitHubUser { id: number; login: string; email: string | null; }
interface GitHubEmail { email: string; primary: boolean; verified: boolean; }

async function githubIdentity(accessToken: string, includePrivateEmail: boolean): Promise<{ user: GitHubUser; email?: string }> {
  const headers = { accept: "application/vnd.github+json", authorization: `Bearer ${accessToken}`, "user-agent": "PaperKG-Remote-MCP" };
  const userResponse = await fetch("https://api.github.com/user", { headers });
  if (!userResponse.ok) throw new Error("GitHub identity lookup failed");
  const user = await userResponse.json<GitHubUser>();
  if (user.email) return { user, email: user.email };
  if (!includePrivateEmail) return { user };
  const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
  if (!emailsResponse.ok) return { user };
  const emails = await emailsResponse.json<GitHubEmail[]>();
  const email = emails.find((item) => item.primary && item.verified)?.email;
  return email ? { user, email } : { user };
}

function ownerAllowed(env: Env, login: string, email?: string): boolean {
  const configuredLogin = env.OWNER_GITHUB_LOGIN?.trim();
  const configuredEmail = env.OWNER_EMAIL?.trim();
  const hasLogin = Boolean(configuredLogin && !configuredLogin.startsWith("SET_"));
  const hasEmail = Boolean(configuredEmail && !configuredEmail.startsWith("SET_"));
  if (!hasLogin && !hasEmail) throw new Error("Owner allowlist is not configured");
  return (hasLogin && configuredLogin!.toLocaleLowerCase() === login.toLocaleLowerCase())
    || (hasEmail && Boolean(email) && configuredEmail!.toLocaleLowerCase() === email!.toLocaleLowerCase());
}

export const authHandler: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      const oauthRecoveryReady = await oauthRecoveryConfigurationReady(env);
      const githubOAuthReady = githubOAuthConfigurationReady(env);
      const meetingStorage = await meetingStorageHealth(env);
      return Response.json(
        {
          ok: oauthRecoveryReady && githubOAuthReady && meetingStorage === "ready",
          service: "paperkg-remote",
          authBuild: AUTH_BUILD_ID,
          canonicalMcp: `${env.PUBLIC_BASE_URL.replace(/\/$/, "")}/mcp`,
          oauthRecovery: oauthRecoveryReady ? "ready" : "invalid",
          githubOAuth: githubOAuthReady ? "ready" : "invalid",
          meetingStorage,
        },
        { headers: { "cache-control": "no-store" } },
      );
    }

    if (url.pathname === "/oauth/resume" && request.method === "GET") {
      const recovered = await resumeCompletedAuthorization(env, requestCookie(request, STATE_COOKIE));
      return recovered ?? terminalAuthResponse("No recoverable OAuth authorization is available", 410);
    }

    if (url.pathname === "/oauth/reissue-loopback" && request.method === "POST") {
      return handleOAuthLoopbackReissue(request, env);
    }

    if (url.pathname === "/authorize" && request.method === "GET") {
      let oauthRequest: AuthRequest;
      try {
        oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(request);
      } catch (error) {
        if (error instanceof AuthorizationError) return oauthErrorResponse(error);
        throw error;
      }
      const client = await env.OAUTH_PROVIDER.lookupClient(oauthRequest.clientId);
      if (!client) return terminalAuthResponse("Unknown OAuth client", 400);
      const consentId = crypto.randomUUID();
      const csrf = crypto.randomUUID();
      await putOAuthTransientState(env, "consent", consentId, JSON.stringify(oauthRequest), TEN_MINUTES);
      return renderConsent(client, oauthRequest, consentId, csrf);
    }

    if (url.pathname === "/authorize" && request.method === "POST") {
      const form = await request.formData();
      const csrf = form.get("csrf_token");
      const consentId = form.get("consent_id");
      if (typeof csrf !== "string" || csrf !== requestCookie(request, CSRF_COOKIE)) {
        return terminalAuthResponse("Invalid CSRF token", 400);
      }
      if (typeof consentId !== "string") {
        return terminalAuthResponse("Missing consent state", 400);
      }
      const stored = await consumeOAuthTransientState(env, "consent", consentId);
      if (!stored) {
        const recovered = await resumeCompletedAuthorization(env, requestCookie(request, STATE_COOKIE));
        return recovered ?? terminalAuthResponse("Expired consent state", 400);
      }
      return startGitHubAuthorization(request, env, JSON.parse(stored) as AuthRequest);
    }

    if (url.pathname === "/callback" && request.method === "GET") {
      const state = url.searchParams.get("state");
      const code = url.searchParams.get("code");
      if (!state || !code) return terminalAuthResponse("Missing GitHub callback parameters", 400);
      const stateHash = await hash(state);
      const fingerprint = stateHash.slice(0, 16);
      await recordOAuthCallbackEventBestEffort(env, fingerprint, "received", "ok");
      if (requestCookie(request, STATE_COOKIE) !== stateHash) {
        await recordOAuthCallbackEventBestEffort(env, fingerprint, "browser_binding", "mismatch");
        return terminalAuthResponse("OAuth browser binding mismatch", 400);
      }
      const stored = await consumeOAuthTransientState(env, "upstream", state);
      if (!stored) {
        const recovered = await resumeCompletedAuthorization(env, stateHash);
        if (recovered) return recovered;
        await recordOAuthCallbackEventBestEffort(env, fingerprint, "state_consume", "missing_or_expired");
        return terminalAuthResponse("Expired OAuth state", 400);
      }
      await recordOAuthCallbackEventBestEffort(env, fingerprint, "state_consume", "ok");
      const oauthRequest = JSON.parse(stored) as AuthRequest;
      let phase = "github_token_exchange";
      try {
        const accessToken = await exchangeGitHubCode(request, env, code);
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "ok");
        phase = "github_identity";
        const includePrivateEmail = githubAuthorizationScopes(env).includes("user:email");
        const identity = await (async () => {
          try {
            return await githubIdentity(accessToken, includePrivateEmail);
          } finally {
            ctx.waitUntil((async () => {
              const revoked = await revokeGitHubTokenBestEffort(env, accessToken);
              await recordOAuthCallbackEventBestEffort(env, fingerprint, "github_token_revoke", revoked ? "ok" : "failed");
            })());
          }
        })();
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "ok");
        phase = "owner_allowlist";
        if (!ownerAllowed(env, identity.user.login, identity.email)) {
          await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "denied");
          return terminalAuthResponse("This GitHub account is not authorized for PaperKG", 403);
        }
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "ok");
        const scopes = oauthRequest.scope.filter((scope) => PAPERKG_SCOPES.includes(scope as typeof PAPERKG_SCOPES[number]));
        const props: AuthProps = { userId: String(identity.user.id), login: identity.user.login, scopes };
        if (identity.email) props.email = identity.email;
        phase = "provider_completion";
        const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
          request: oauthRequest,
          userId: props.userId,
          metadata: { login: props.login },
          scope: scopes,
          props,
        });
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "ok");
        phase = "redirect_recovery_store";
        const recoveryStored = await storeCompletedOAuthRedirectBestEffort(env, stateHash, redirectTo, TEN_MINUTES);
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, recoveryStored ? "ok" : "failed");
        return terminalAuthResponse(null, 302, { location: redirectTo });
      } catch (error) {
        await recordOAuthCallbackEventBestEffort(env, fingerprint, phase, "failed");
        console.error(JSON.stringify({ event: "oauth_callback_failure", phase, error_name: error instanceof Error ? error.name : "unknown" }));
        return terminalAuthResponse(`OAuth callback failed during ${phase}. Start a new connection attempt.`, 502);
      }
    }

    return new Response("PaperKG Remote MCP", { status: 404 });
  },
};
