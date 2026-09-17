import type { Env } from "./types.js";

const PUBLIC_OAUTH_BODY_LIMIT_BYTES = 64 * 1_024;
const MCP_BODY_LIMIT_BYTES = 1 * 1_024 * 1_024;

type GuardEnv = Pick<Env, "OAUTH_FLOW_RATE_LIMITER" | "OAUTH_REGISTRATION_RATE_LIMITER">;

function guardedBodyLimit(request: Request): number | null {
  if (request.method !== "POST") return null;
  const pathname = new URL(request.url).pathname;
  if (["/authorize", "/oauth/register", "/oauth/reissue-loopback", "/oauth/token"].includes(pathname)) {
    return PUBLIC_OAUTH_BODY_LIMIT_BYTES;
  }
  return pathname === "/mcp" ? MCP_BODY_LIMIT_BYTES : null;
}

function jsonFailure(status: number, error: string, retryAfter?: number): Response {
  const headers = new Headers({
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  if (retryAfter !== undefined) headers.set("retry-after", String(retryAfter));
  return new Response(JSON.stringify({ error }), { status, headers });
}

async function rateLimitOAuthMutation(request: Request, env: GuardEnv): Promise<Response | null> {
  if (request.method !== "POST") return null;
  const pathname = new URL(request.url).pathname;
  const rateLimit = pathname === "/oauth/register"
    ? { binding: env.OAUTH_REGISTRATION_RATE_LIMITER, key: "oauth-register" }
    : ["/authorize", "/oauth/reissue-loopback", "/oauth/token"].includes(pathname)
      ? { binding: env.OAUTH_FLOW_RATE_LIMITER, key: pathname }
      : null;
  if (!rateLimit) return null;

  try {
    const outcome = await rateLimit.binding.limit({ key: rateLimit.key });
    if (outcome.success) return null;
    console.warn(JSON.stringify({ event: "oauth_rate_limit", path: pathname, outcome: "limited" }));
    return jsonFailure(429, "Too many OAuth requests", 60);
  } catch (error) {
    console.error(JSON.stringify({
      event: "oauth_rate_limit",
      path: pathname,
      outcome: "unavailable",
      error_name: error instanceof Error ? error.name : "unknown",
    }));
    return jsonFailure(503, "OAuth request protection is temporarily unavailable", 5);
  }
}

async function boundedRequest(request: Request, limitBytes: number): Promise<Request | Response> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > limitBytes) {
    return jsonFailure(413, "Request body is too large");
  }
  if (!request.body) return request;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    totalBytes += next.value.byteLength;
    if (totalBytes > limitBytes) {
      await reader.cancel().catch(() => undefined);
      return jsonFailure(413, "Request body is too large");
    }
    chunks.push(next.value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Request(request, { body });
}

export async function guardPublicRequest(request: Request, env: GuardEnv): Promise<Request | Response> {
  const limited = await rateLimitOAuthMutation(request, env);
  if (limited) return limited;
  const bodyLimit = guardedBodyLimit(request);
  return bodyLimit === null ? request : boundedRequest(request, bodyLimit);
}
