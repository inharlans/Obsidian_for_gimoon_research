import { describe, expect, it } from "vitest";
import { oauthReissueRequestHash } from "../src/oauth-reissue.js";

const request = {
  state: "state-state-state-state-state-state-01",
  client_id: "client-12345678",
  code_challenge: "challenge-challenge-challenge-challenge-1234567",
  code_challenge_method: "S256",
  redirect_uri: "http://127.0.0.1:63424/api/connectors/paperkg/oauth/callback",
  resource: "https://paperkg.example/mcp",
  scope: "paperkg.meeting.submit",
};

describe("operator-authorized loopback OAuth reissue", () => {
  it("hashes the exact public PKCE transaction deterministically", async () => {
    const first = await oauthReissueRequestHash(request);
    const second = await oauthReissueRequestHash({ ...request });
    const changed = await oauthReissueRequestHash({ ...request, state: `${request.state}-different` });

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).toBe(first);
    expect(changed).not.toBe(first);
  });

  it("rejects a non-S256 transaction before hashing", async () => {
    await expect(oauthReissueRequestHash({
      ...request,
      code_challenge_method: "plain",
    })).rejects.toThrow();
  });
});
