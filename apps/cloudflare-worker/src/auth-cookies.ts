export const CSRF_COOKIE = "__Host-PaperKG-CSRF";
export const STATE_COOKIE = "__Host-PaperKG-OAUTH-STATE";

const TEN_MINUTES = 600;

export function requestCookie(request: Request, name: string): string | undefined {
  const entries = (request.headers.get("cookie") ?? "").split(";");
  for (const entry of entries) {
    const [key, ...rest] = entry.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

export function secureCookie(name: string, value: string, maxAge = TEN_MINUTES): string {
  return `${name}=${value}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie(name: string): string {
  return secureCookie(name, "", 0);
}

export function authHeaders(
  initial: HeadersInit = {},
  cookies: readonly string[] = [],
): Headers {
  const headers = new Headers(initial);
  for (const value of cookies) headers.append("set-cookie", value);
  return headers;
}

export function clearBrowserAuthCookies(): string[] {
  return [clearCookie(CSRF_COOKIE), clearCookie(STATE_COOKIE)];
}

export function terminalAuthResponse(
  body: BodyInit | null,
  status: number,
  initial: HeadersInit = {},
): Response {
  const headers = authHeaders(initial, clearBrowserAuthCookies());
  headers.set("cache-control", "no-store");
  return new Response(body, { status, headers });
}
