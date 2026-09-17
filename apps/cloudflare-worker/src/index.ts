import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { createMcpHandler } from "agents/mcp/server";
import { WorkerEntrypoint } from "cloudflare:workers";
import { authHandler, PAPERKG_SCOPES } from "./auth.js";
import { handleProtectedApi, purgeStaleMeetingIngestions } from "./meeting.js";
import { createPaperKgMcpServer } from "./mcp.js";
import { purgeExpiredCompletedOAuthRedirects } from "./oauth-recovery.js";
import { purgeExpiredOAuthTransientState } from "./oauth-state.js";
import { guardPublicRequest } from "./public-request-guard.js";
import { runScheduledCleanup } from "./scheduled-cleanup.js";
import type { AuthProps, Env } from "./types.js";

export class PaperKgProtectedApi extends WorkerEntrypoint<Env, AuthProps> {
  async fetch(request: Request): Promise<Response> {
    const routed = await handleProtectedApi(request, this.env, this.ctx.props);
    if (routed) return routed;
    if (new URL(request.url).pathname !== "/mcp") return new Response("Not found", { status: 404 });
    const handler = createMcpHandler(
      () => createPaperKgMcpServer(this.env, this.ctx.props.scopes),
      { route: "/mcp", legacy: "stateless", responseMode: "auto" },
    );
    return handler(request, this.env, this.ctx);
  }
}

function provider(env: Env): OAuthProvider<Env> {
  const baseUrl = env.PUBLIC_BASE_URL.replace(/\/$/, "");
  return new OAuthProvider<Env>({
    apiRoute: "/mcp",
    apiHandler: PaperKgProtectedApi,
    defaultHandler: authHandler,
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    clientRegistrationEndpoint: "/oauth/register",
    clientIdMetadataDocumentEnabled: true,
    scopesSupported: [...PAPERKG_SCOPES],
    allowPlainPKCE: false,
    allowImplicitFlow: false,
    resourceMetadata: {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [baseUrl],
      scopes_supported: [...PAPERKG_SCOPES],
      bearer_methods_supported: ["header"],
      resource_name: "PaperKG scholarly knowledge graph",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const guarded = await guardPublicRequest(request, env);
    if (guarded instanceof Response) return guarded;
    return provider(env).fetch(guarded, env, ctx);
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runScheduledCleanup([
      { name: "oauth_provider", run: () => provider(env).purgeExpiredData(env, { batchSize: 100 }) },
      { name: "oauth_transient", run: () => purgeExpiredOAuthTransientState(env) },
      { name: "oauth_redirect_recovery", run: () => purgeExpiredCompletedOAuthRedirects(env) },
      { name: "meeting_ingestion_pending", run: () => purgeStaleMeetingIngestions(env) },
    ]));
  },
} satisfies ExportedHandler<Env>;
