import { cp, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createPaperKgHttpApp } from "./http.js";

describe("hosted HTTP service", () => {
  it("accepts an idempotent meeting envelope only into the inbox", async () => {
    const vaultRoot = await mkdtemp(path.join(tmpdir(), "paperkg-http-"));
    await cp(path.resolve("fixtures/valid-vault"), vaultRoot, { recursive: true });
    const hosted = await createPaperKgHttpApp({
      vaultRoot,
      publicBaseUrl: "http://localhost",
      auth: { mode: "development" }
    });
    const listener = hosted.app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => listener.once("listening", resolve));
    try {
      const address = listener.address();
      if (!address || typeof address === "string") throw new Error("Missing HTTP test address");
      const url = `http://127.0.0.1:${address.port}`;
      const body = {
        schema_version: "1.0",
        external_meeting_id: "http-1",
        source_system: "test",
        title: "HTTP meeting",
        started_at: "2026-08-11T09:00:00+09:00"
      };
      const first = await fetch(`${url}/v1/meeting-ingestions`, {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": "http-meeting-1" },
        body: JSON.stringify(body)
      });
      expect(first.status).toBe(201);
      const receipt = await first.json() as { receipt_id: string; note_path: string };
      const replay = await fetch(`${url}/v1/meeting-ingestions`, {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": "http-meeting-1" },
        body: JSON.stringify(body)
      });
      expect(replay.status).toBe(200);
      expect((await readFile(path.join(vaultRoot, receipt.note_path), "utf8"))).toContain("curation_status: candidate");
      const status = await fetch(`${url}/v1/meeting-ingestions/${receipt.receipt_id}`);
      expect(status.status).toBe(200);
    } finally {
      await new Promise<void>((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
      await hosted.close();
    }
  });

  it("publishes protected-resource metadata and rejects unauthenticated MCP calls", async () => {
    const vaultRoot = await mkdtemp(path.join(tmpdir(), "paperkg-http-oauth-"));
    await cp(path.resolve("fixtures/valid-vault"), vaultRoot, { recursive: true });
    const hosted = await createPaperKgHttpApp({
      vaultRoot,
      publicBaseUrl: "http://localhost",
      auth: {
        mode: "oauth",
        config: {
          issuer: "http://127.0.0.1:9999",
          audience: "http://localhost",
          jwksUri: "http://127.0.0.1:9999/jwks",
          metadata: {
            issuer: "http://127.0.0.1:9999",
            authorization_endpoint: "http://127.0.0.1:9999/authorize",
            token_endpoint: "http://127.0.0.1:9999/token",
            response_types_supported: ["code"],
            code_challenge_methods_supported: ["S256"]
          }
        }
      }
    });
    const listener = hosted.app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => listener.once("listening", resolve));
    try {
      const address = listener.address();
      if (!address || typeof address === "string") throw new Error("Missing OAuth HTTP test address");
      const url = `http://127.0.0.1:${address.port}`;
      const metadata = await fetch(`${url}/.well-known/oauth-protected-resource`);
      expect(metadata.status).toBe(200);
      expect((await metadata.json() as { authorization_servers: string[] }).authorization_servers).toContain("http://127.0.0.1:9999");
      const denied = await fetch(`${url}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })
      });
      expect(denied.status).toBe(401);
      expect(denied.headers.get("www-authenticate")).toContain("resource_metadata");
    } finally {
      await new Promise<void>((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
      await hosted.close();
    }
  });
});
