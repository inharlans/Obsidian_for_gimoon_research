import { createServer } from "node:http";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { createJwtTokenVerifier, type OAuthRuntimeConfig } from "./auth.js";

describe("OAuth JWT verifier", () => {
  it("validates issuer, audience, subject, and scopes through JWKS", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const jwk = await exportJWK(publicKey);
    Object.assign(jwk, { kid: "test-key", alg: "RS256", use: "sig" });
    const server = createServer((_request, response) => {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ keys: [jwk] }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing JWKS test address");
      const issuer = `http://127.0.0.1:${address.port}`;
      const config: OAuthRuntimeConfig = {
        issuer,
        audience: "https://paperkg.example",
        jwksUri: `${issuer}/jwks`,
        metadata: {
          issuer,
          authorization_endpoint: `${issuer}/authorize`,
          token_endpoint: `${issuer}/token`,
          response_types_supported: ["code"],
          code_challenge_methods_supported: ["S256"]
        }
      };
      const token = await new SignJWT({ scope: "paperkg.read paperkg.meeting.submit", client_id: "meeting-app" })
        .setProtectedHeader({ alg: "RS256", kid: "test-key" })
        .setIssuer(issuer)
        .setAudience(config.audience)
        .setSubject("user-42")
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(privateKey);
      const info = await createJwtTokenVerifier(config).verifyAccessToken(token);
      expect(info.extra?.sub).toBe("user-42");
      expect(info.clientId).toBe("meeting-app");
      expect(info.scopes).toContain("paperkg.meeting.submit");
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
