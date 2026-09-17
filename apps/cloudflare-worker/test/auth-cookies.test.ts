import { describe, expect, it } from "vitest";
import {
  authHeaders,
  clearBrowserAuthCookies,
  CSRF_COOKIE,
  requestCookie,
  secureCookie,
  STATE_COOKIE,
  terminalAuthResponse,
} from "../src/auth-cookies.js";

describe("OAuth browser cookie lifecycle", () => {
  it("uses host-only hardened cookies and parses exact cookie names", () => {
    const value = secureCookie(CSRF_COOKIE, "csrf-value");
    expect(value).toContain("HttpOnly; Secure; Path=/; SameSite=Lax");
    expect(value).not.toContain("Domain=");
    expect(requestCookie(new Request("https://example.com", {
      headers: { cookie: `${CSRF_COOKIE}=csrf-value; ${STATE_COOKIE}=state-value` },
    }), STATE_COOKIE)).toBe("state-value");
  });

  it("expires both browser-bound cookies at an authorization terminal response", () => {
    const headers = authHeaders(
      { location: "https://github.com/login/oauth/authorize" },
      clearBrowserAuthCookies(),
    );
    const setCookie = headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${CSRF_COOKIE}=`);
    expect(setCookie).toContain(`${STATE_COOKIE}=`);
    expect(setCookie.match(/Max-Age=0/g)).toHaveLength(2);
  });

  it("makes every terminal OAuth response non-cacheable and clears both cookies", () => {
    const response = terminalAuthResponse("denied", 403);
    expect(response.status).toBe(403);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(CSRF_COOKIE);
    expect(setCookie).toContain(STATE_COOKIE);
    expect(setCookie.match(/Max-Age=0/g)).toHaveLength(2);
  });
});
