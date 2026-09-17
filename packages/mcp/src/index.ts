import path from "node:path";
import { Command } from "commander";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPaperKgServer } from "./server.js";
import { loadOAuthRuntimeConfig } from "./auth.js";
import { createPaperKgHttpApp } from "./http.js";

const program = new Command();
program.name("paperkg-mcp");

program.command("stdio").description("Development/test transport only; not a supported user deployment")
  .option("--vault <path>", "vault root", "vault/PaperKG")
  .option("--include-evidence", "include approved evidence snippets")
  .action(async (options: { vault: string; includeEvidence?: boolean }) => {
    const server = await createPaperKgServer({ vaultRoot: path.resolve(options.vault), includeEvidence: options.includeEvidence ?? false });
    await server.connect(new StdioServerTransport());
  });

program.command("http").description("Run the OAuth-protected hosted PaperKG service")
  .option("--vault <path>", "vault root", "vault/PaperKG")
  .option("--host <address>", "listen address", process.env.PAPERKG_HOST ?? "0.0.0.0")
  .option("--port <number>", "HTTP port", process.env.PORT ?? "8787")
  .option("--public-base-url <url>")
  .option("--reindex-interval-ms <number>", "periodic derived-index rebuild interval", process.env.PAPERKG_REINDEX_INTERVAL_MS ?? "60000")
  .option("--allow-insecure-no-auth", "development smoke tests only")
  .action(async (options: { vault: string; host: string; port: string; publicBaseUrl?: string; reindexIntervalMs: string; allowInsecureNoAuth?: boolean }) => {
    const vaultRoot = path.resolve(options.vault);
    const publicBaseUrl = options.publicBaseUrl ?? process.env.PAPERKG_PUBLIC_BASE_URL ?? (options.allowInsecureNoAuth ? `http://localhost:${options.port}` : undefined);
    if (!publicBaseUrl) throw new Error("--public-base-url or PAPERKG_PUBLIC_BASE_URL is required in hosted OAuth mode");
    const parsedPublicUrl = new URL(publicBaseUrl);
    if (!options.allowInsecureNoAuth && parsedPublicUrl.protocol !== "https:") throw new Error("Hosted OAuth mode requires an HTTPS public base URL");
    const auth = options.allowInsecureNoAuth
      ? { mode: "development" as const }
      : { mode: "oauth" as const, config: await loadOAuthRuntimeConfig() };
    const hosted = await createPaperKgHttpApp({
      vaultRoot,
      publicBaseUrl,
      auth,
      reindexIntervalMs: Number(options.reindexIntervalMs)
    });
    const listener = hosted.app.listen(Number(options.port), options.host, () => {
      console.log(`PaperKG hosted service listening on ${options.host}:${options.port}; public MCP URL ${publicBaseUrl.replace(/\/$/, "")}/mcp`);
    });
    const stop = async () => {
      listener.close();
      await hosted.close();
    };
    process.once("SIGTERM", () => { void stop(); });
    process.once("SIGINT", () => { void stop(); });
  });

await program.parseAsync(process.argv);
