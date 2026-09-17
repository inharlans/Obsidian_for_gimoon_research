import { InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import type { OAuthTokenVerifier } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { OAuthMetadata } from "@modelcontextprotocol/sdk/shared/auth.js";
import * as jose from "jose";
import { z } from "zod";

export const PAPERKG_SCOPES = [
  "paperkg.read",
  "paperkg.evidence.read",
  "paperkg.meeting.submit"
] as const;

const providerMetadataSchema = z.object({
  issuer: z.string().url(),
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  jwks_uri: z.string().url().optional(),
  registration_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
  scopes_supported: z.array(z.string()).optional(),
  response_types_supported: z.array(z.string()).default(["code"]),
  grant_types_supported: z.array(z.string()).default(["authorization_code", "refresh_token"]),
  code_challenge_methods_supported: z.array(z.string()).default(["S256"]),
  token_endpoint_auth_methods_supported: z.array(z.string()).optional()
}).passthrough();

export interface OAuthRuntimeConfig {
  issuer: string;
  audience: string;
  jwksUri: string;
  metadata: OAuthMetadata;
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

async function fetchProviderMetadata(issuer: string): Promise<z.infer<typeof providerMetadataSchema>> {
  const candidates = [
    `${withoutTrailingSlash(issuer)}/.well-known/oauth-authorization-server`,
    `${withoutTrailingSlash(issuer)}/.well-known/openid-configuration`
  ];
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10_000)
      });
      if (!response.ok) continue;
      const parsed = providerMetadataSchema.safeParse(await response.json());
      if (parsed.success) return parsed.data;
    } catch {
      // Try the next standard metadata endpoint.
    }
  }
  throw new Error(`Unable to discover OAuth metadata for issuer ${issuer}`);
}

export async function loadOAuthRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): Promise<OAuthRuntimeConfig> {
  const issuer = environment.PAPERKG_OAUTH_ISSUER?.trim();
  const audience = environment.PAPERKG_OAUTH_AUDIENCE?.trim();
  if (!issuer || !audience) {
    throw new Error("PAPERKG_OAUTH_ISSUER and PAPERKG_OAUTH_AUDIENCE are required for hosted mode");
  }
  const discovered = await fetchProviderMetadata(issuer);
  if (withoutTrailingSlash(discovered.issuer) !== withoutTrailingSlash(issuer)) {
    throw new Error("Discovered OAuth issuer does not match PAPERKG_OAUTH_ISSUER");
  }
  const authorizationEndpoint = environment.PAPERKG_OAUTH_AUTHORIZATION_ENDPOINT?.trim() || discovered.authorization_endpoint;
  const tokenEndpoint = environment.PAPERKG_OAUTH_TOKEN_ENDPOINT?.trim() || discovered.token_endpoint;
  const jwksUri = environment.PAPERKG_OAUTH_JWKS_URI?.trim() || discovered.jwks_uri;
  if (!jwksUri) throw new Error("OAuth provider metadata must expose jwks_uri or PAPERKG_OAUTH_JWKS_URI must be set");
  const registrationEndpoint = environment.PAPERKG_OAUTH_REGISTRATION_ENDPOINT?.trim() || discovered.registration_endpoint;
  const revocationEndpoint = environment.PAPERKG_OAUTH_REVOCATION_ENDPOINT?.trim() || discovered.revocation_endpoint;
  const metadata: OAuthMetadata = {
    issuer,
    authorization_endpoint: authorizationEndpoint,
    token_endpoint: tokenEndpoint,
    response_types_supported: discovered.response_types_supported,
    grant_types_supported: discovered.grant_types_supported,
    code_challenge_methods_supported: discovered.code_challenge_methods_supported,
    ...(discovered.token_endpoint_auth_methods_supported ? { token_endpoint_auth_methods_supported: discovered.token_endpoint_auth_methods_supported } : {}),
    ...(registrationEndpoint ? { registration_endpoint: registrationEndpoint } : {}),
    ...(revocationEndpoint ? { revocation_endpoint: revocationEndpoint } : {}),
    scopes_supported: [...PAPERKG_SCOPES]
  };
  return { issuer, audience, jwksUri, metadata };
}

function tokenScopes(payload: jose.JWTPayload): string[] {
  const values = new Set<string>();
  if (typeof payload.scope === "string") {
    for (const scope of payload.scope.split(/\s+/).filter(Boolean)) values.add(scope);
  }
  const scp = payload.scp;
  if (typeof scp === "string") {
    for (const scope of scp.split(/\s+/).filter(Boolean)) values.add(scope);
  } else if (Array.isArray(scp)) {
    for (const scope of scp) if (typeof scope === "string") values.add(scope);
  }
  return [...values];
}

export function createJwtTokenVerifier(config: OAuthRuntimeConfig): OAuthTokenVerifier {
  const jwks = jose.createRemoteJWKSet(new URL(config.jwksUri));
  return {
    async verifyAccessToken(token: string): Promise<AuthInfo> {
      try {
        const { payload } = await jose.jwtVerify(token, jwks, {
          issuer: config.issuer,
          audience: config.audience
        });
        if (!payload.sub || typeof payload.sub !== "string") throw new InvalidTokenError("missing sub claim");
        const clientId = payload.client_id ?? payload.azp;
        return {
          token,
          clientId: typeof clientId === "string" ? clientId : "",
          scopes: tokenScopes(payload),
          ...(payload.exp ? { expiresAt: payload.exp } : {}),
          extra: { sub: payload.sub }
        };
      } catch (error) {
        if (error instanceof InvalidTokenError) throw error;
        throw new InvalidTokenError("access token validation failed");
      }
    }
  };
}
