# Optional self-hosted OAuth issuer

This stack supplies Keycloak and PostgreSQL for operators who do not want a paid OAuth provider. It is separate from the PaperKG resource server. Production TLS and both public hostnames belong at a hardened reverse proxy or load balancer.

1. Copy `.env.example` to a secret-managed file and replace every placeholder.
2. Start with `docker compose --env-file /secure/keycloak.env -f deploy/keycloak/docker-compose.yml up -d`.
3. Route `https://auth.example.com` to `127.0.0.1:8080` and confirm forwarded headers are overwritten by the proxy.
4. Log in once with the bootstrap administrator, create the `paperkg` realm, then remove or rotate the bootstrap credential.
5. Create client scopes `paperkg.read`, `paperkg.evidence.read`, and `paperkg.meeting.submit`; include granted scopes in the JWT `scope` claim.
6. Configure an audience mapper so access tokens contain `https://paperkg.example.com` in `aud`.
7. Create the meeting app as a public authorization-code client with PKCE S256 and exact redirect URIs.
8. For ChatGPT, either configure controlled OpenID Connect Dynamic Client Registration or manually register the callback URI shown by ChatGPT. Do not enable unrestricted anonymous registration without Keycloak client policies.
9. Set PaperKG's issuer to `https://auth.example.com/realms/paperkg` and its audience to `https://paperkg.example.com`.

Keycloak publishes discovery and JWKS endpoints. PaperKG reads discovery at startup and validates every access token locally. The official references are [Keycloak containers](https://www.keycloak.org/server/containers), [client registration](https://www.keycloak.org/securing-apps/client-registration), and [realm import/export](https://www.keycloak.org/server/importExport).
