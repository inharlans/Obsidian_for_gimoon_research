import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import express, { type Request, type RequestHandler } from "express";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { getOAuthProtectedResourceMetadataUrl, mcpAuthMetadataRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { defaultDatabasePath, PaperKgIndex, rebuildIndex, type IndexedNote } from "@paperkg/indexer";
import { createJwtTokenVerifier, PAPERKG_SCOPES, type OAuthRuntimeConfig } from "./auth.js";
import { getMeetingReceipt, ingestMeeting, MeetingConflictError } from "./meeting.js";
import { createPaperKgServer } from "./server.js";

export type HostedAuthMode =
  | { mode: "oauth"; config: OAuthRuntimeConfig }
  | { mode: "development"; subject?: string; scopes?: string[] };

export interface PaperKgHttpOptions {
  vaultRoot: string;
  publicBaseUrl: string;
  auth: HostedAuthMode;
  reindexIntervalMs?: number;
}

export interface PaperKgHostedApp {
  app: express.Express;
  close: () => Promise<void>;
}

interface SessionRecord {
  transport: StreamableHTTPServerTransport;
  subjectHash: string;
  includeEvidence: boolean;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function subjectOf(request: Request): string {
  const subject = request.auth?.extra?.sub;
  if (typeof subject === "string" && subject) return subject;
  if (request.auth?.clientId) return request.auth.clientId;
  throw new Error("Authenticated request is missing a subject");
}

function hasScope(request: Request, scope: string): boolean {
  return request.auth?.scopes.includes(scope) ?? false;
}

function developmentProtection(scope: string, auth: Extract<HostedAuthMode, { mode: "development" }>): RequestHandler {
  return (request, _response, next) => {
    const scopes = auth.scopes ?? [...PAPERKG_SCOPES];
    request.auth = {
      token: "development-only",
      clientId: "paperkg-development",
      scopes,
      extra: { sub: auth.subject ?? "paperkg-development-user" }
    } satisfies AuthInfo;
    if (!scopes.includes(scope)) {
      const error = new Error(`Development token lacks required scope ${scope}`);
      (error as Error & { status?: number }).status = 403;
      next(error);
      return;
    }
    next();
  };
}

function approved(note: IndexedNote | undefined): note is IndexedNote {
  const status = note?.frontmatter.curation_status;
  return Boolean(note && (status === "reviewed" || status === "verified"));
}

function approvedSummary(body: string, includeEvidence: boolean): string {
  if (includeEvidence) return body.slice(0, 12_000);
  return body.replace(/^> \[!evidence\][\s\S]*?(?=\n\n|$)/gm, "[Evidence omitted: paperkg.evidence.read is required]").slice(0, 12_000);
}

function safeLog(event: string, data: Record<string, unknown>): void {
  process.stdout.write(`${JSON.stringify({ timestamp: new Date().toISOString(), event, ...data })}\n`);
}

function safeError(error: unknown): string {
  if (error instanceof MeetingConflictError) return error.message;
  if (error instanceof z.ZodError) return "Meeting envelope validation failed";
  return error instanceof Error ? error.message : "Unknown server error";
}

export async function createPaperKgHttpApp(options: PaperKgHttpOptions): Promise<PaperKgHostedApp> {
  const vaultRoot = path.resolve(options.vaultRoot);
  const databasePath = defaultDatabasePath(vaultRoot);
  await rebuildIndex(vaultRoot, databasePath);
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "12mb", type: ["application/json", "application/*+json"] }));
  app.use((request, response, next) => {
    const requestId = String(request.headers["x-request-id"] ?? randomUUID()).slice(0, 200);
    response.setHeader("x-request-id", requestId);
    const started = Date.now();
    response.on("finish", () => {
      let subjectHash: string | undefined;
      try { subjectHash = sha256(subjectOf(request)).slice(0, 16); } catch { /* Public endpoint. */ }
      safeLog("http_request", {
        request_id: requestId,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        duration_ms: Date.now() - started,
        ...(subjectHash ? { subject_hash: subjectHash } : {})
      });
    });
    next();
  });

  const publicBaseUrl = options.publicBaseUrl.replace(/\/$/, "");
  const resourceServerUrl = new URL(`${publicBaseUrl}/`);
  let protectRead: RequestHandler;
  let protectMeeting: RequestHandler;
  if (options.auth.mode === "oauth") {
    const verifier = createJwtTokenVerifier(options.auth.config);
    app.use(mcpAuthMetadataRouter({
      oauthMetadata: options.auth.config.metadata,
      resourceServerUrl,
      serviceDocumentationUrl: new URL("/docs/hosted", `${publicBaseUrl}/`),
      scopesSupported: [...PAPERKG_SCOPES],
      resourceName: "PaperKG"
    }));
    const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(resourceServerUrl);
    protectRead = requireBearerAuth({ verifier, requiredScopes: ["paperkg.read"], resourceMetadataUrl });
    protectMeeting = requireBearerAuth({ verifier, requiredScopes: ["paperkg.meeting.submit"], resourceMetadataUrl });
  } else {
    protectRead = developmentProtection("paperkg.read", options.auth);
    protectMeeting = developmentProtection("paperkg.meeting.submit", options.auth);
  }

  app.get("/health", (_request, response) => response.json({ ok: true, service: "paperkg-hosted", version: "0.2.0" }));
  app.get("/ready", (_request, response) => {
    const ready = existsSync(vaultRoot) && existsSync(databasePath);
    response.status(ready ? 200 : 503).json({ ok: ready, vault_mounted: existsSync(vaultRoot), index_ready: existsSync(databasePath) });
  });
  app.get("/docs/hosted", (_request, response) => response.json({
    service: "PaperKG",
    mcp: `${publicBaseUrl}/mcp`,
    meeting_ingestion: `${publicBaseUrl}/v1/meeting-ingestions`,
    oauth_scopes: [...PAPERKG_SCOPES],
    repository_docs: ["SPEC.md", "docs/09-hosted-deployment.md", "docs/10-meeting-app-integration.md"]
  }));

  const sessions = new Map<string, SessionRecord>();
  app.all("/mcp", protectRead, async (request, response) => {
    try {
      const sessionHeader = request.headers["mcp-session-id"];
      const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;
      const subjectHash = sha256(subjectOf(request));
      const includeEvidence = hasScope(request, "paperkg.evidence.read");
      let record = sessionId ? sessions.get(sessionId) : undefined;
      if (record && (record.subjectHash !== subjectHash || record.includeEvidence !== includeEvidence)) {
        response.status(403).json({ jsonrpc: "2.0", error: { code: -32001, message: "MCP session identity or scope changed" }, id: null });
        return;
      }
      if (!record) {
        if (request.method !== "POST" || !isInitializeRequest(request.body)) {
          response.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "Missing or invalid MCP session" }, id: null });
          return;
        }
        let created!: StreamableHTTPServerTransport;
        created = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            sessions.set(id, { transport: created, subjectHash, includeEvidence });
          }
        });
        created.onclose = () => { if (created.sessionId) sessions.delete(created.sessionId); };
        const sessionServer = await createPaperKgServer({ vaultRoot, publicBaseUrl, includeEvidence });
        await sessionServer.connect(created);
        record = { transport: created, subjectHash, includeEvidence };
      }
      await record.transport.handleRequest(request, response, request.body);
    } catch (error) {
      safeLog("mcp_error", { message: safeError(error) });
      if (!response.headersSent) response.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "MCP request failed" }, id: null });
    }
  });

  app.get("/notes/:id", protectRead, (request, response) => {
    const index = new PaperKgIndex(databasePath);
    try {
      const note = index.get(String(request.params.id));
      if (!approved(note)) { response.status(404).json({ error: "Not found" }); return; }
      const body = approvedSummary(note.body, hasScope(request, "paperkg.evidence.read"));
      response.type("text/markdown").send(`# ${note.title}\n\n- ID: ${note.id}\n- Type: ${note.type}\n- Curation: ${String(note.frontmatter.curation_status)}\n\n${body}`);
    } finally {
      index.close();
    }
  });

  const meetingRate = new Map<string, { windowStarted: number; count: number }>();
  app.post("/v1/meeting-ingestions", protectMeeting, async (request, response) => {
    const subject = subjectOf(request);
    const subjectHash = sha256(subject);
    const now = Date.now();
    const current = meetingRate.get(subjectHash);
    const rate = !current || now - current.windowStarted >= 60_000 ? { windowStarted: now, count: 1 } : { ...current, count: current.count + 1 };
    meetingRate.set(subjectHash, rate);
    if (rate.count > 60) {
      response.setHeader("retry-after", "60");
      response.status(429).json({ error: "meeting_submission_rate_limited" });
      return;
    }
    const header = request.headers["idempotency-key"];
    const idempotencyKey = Array.isArray(header) ? header[0] : header;
    if (!idempotencyKey) {
      response.status(400).json({ error: "idempotency_key_required" });
      return;
    }
    try {
      const receipt = await ingestMeeting({ vaultRoot, envelope: request.body, idempotencyKey, subject });
      response.status(receipt.replayed ? 200 : 201).json(receipt);
    } catch (error) {
      if (error instanceof MeetingConflictError) {
        response.status(409).json({ error: "idempotency_conflict", message: error.message });
        return;
      }
      if (error instanceof z.ZodError) {
        response.status(422).json({
          error: "invalid_meeting_envelope",
          issues: error.issues.slice(0, 50).map((issue) => ({ path: issue.path.join("."), message: issue.message }))
        });
        return;
      }
      response.status(400).json({ error: "meeting_ingestion_failed", message: safeError(error) });
    }
  });

  app.get("/v1/meeting-ingestions/:receipt", protectMeeting, async (request, response) => {
    const receipt = await getMeetingReceipt(vaultRoot, String(request.params.receipt), subjectOf(request));
    if (!receipt) { response.status(404).json({ error: "not_found" }); return; }
    response.json(receipt);
  });

  app.use((error: Error & { status?: number }, _request: Request, response: express.Response, _next: express.NextFunction) => {
    safeLog("http_error", { message: safeError(error), status: error.status ?? 500 });
    response.status(error.status ?? 500).json({ error: error.status === 403 ? "insufficient_scope" : "server_error" });
  });

  const intervalMs = Math.max(0, options.reindexIntervalMs ?? 0);
  const interval = intervalMs > 0 ? setInterval(() => {
    rebuildIndex(vaultRoot, databasePath)
      .then((result) => safeLog("index_rebuilt", { notes: result.notes, chunks: result.chunks, edges: result.edges }))
      .catch((error: unknown) => safeLog("index_rebuild_failed", { message: safeError(error) }));
  }, intervalMs) : undefined;
  interval?.unref();

  return {
    app,
    close: async () => {
      if (interval) clearInterval(interval);
      await Promise.all([...sessions.values()].map(({ transport }) => transport.close().catch(() => undefined)));
      sessions.clear();
    }
  };
}
