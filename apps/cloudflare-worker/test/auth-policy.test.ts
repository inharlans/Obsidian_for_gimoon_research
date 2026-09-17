import { describe, expect, it } from "vitest";
import { CONSENT_CSP } from "../src/auth-policy.js";

describe("hosted OAuth browser policy", () => {
  it("allows only the local consent post and the GitHub OAuth redirect chain", () => {
    expect(CONSENT_CSP).toContain("form-action 'self' https://github.com");
    expect(CONSENT_CSP).toContain("frame-ancestors 'none'");
    expect(CONSENT_CSP).not.toContain("form-action *");
  });
});
