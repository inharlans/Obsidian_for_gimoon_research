# Local Codex workflow (no AI API)

## Add and analyze a paper

```powershell
pnpm paperkg ingest-pdf "C:\papers\paper.pdf" --vault vault/PaperKG
```

This creates a source hash, page text, and a review work order under
`10_Inbox/Imports`. Ask Codex to read that work order and only the referenced
paper. Codex writes a candidate proposal, never canonical notes directly.

```powershell
pnpm paperkg proposal create candidate.json --vault vault/PaperKG
pnpm paperkg proposal show <proposal-id> --vault vault/PaperKG
pnpm paperkg proposal approve <proposal-id> --vault vault/PaperKG
pnpm paperkg proposal apply <proposal-id> --token <local-token> --vault vault/PaperKG
```

The token is short lived and single use. The apply step verifies proposal
hash, base file hashes, paths, and schema before atomic writes.

## Rebuild and query

```powershell
pnpm paperkg validate vault/PaperKG
pnpm paperkg index --vault vault/PaperKG
pnpm paperkg search "adaptive memory" --vault vault/PaperKG
pnpm paperkg benchmark-usage bm_example --vault vault/PaperKG
pnpm paperkg trace-problem pr_example --vault vault/PaperKG
```

## Run Obsidian plugin

Build the plugin, copy `main.js`, `manifest.json`, and `styles.css` from
`apps/obsidian-plugin/dist` to
`vault/PaperKG/.obsidian/plugins/paperkg`, then enable PaperKG in Obsidian.
The `pnpm install:plugin` script performs the copy.

## Hosted MCP development smoke test

```powershell
pnpm test:mcp-http
```

This command uses an explicitly unauthenticated loopback-only test profile. It
is not a supported way to connect ChatGPT. The real service runs on a stable
HTTPS hostname with OAuth as described in `docs/09-hosted-deployment.md`.

Run `pnpm test:mcp-http` after building to smoke-test health, two independent
MCP sessions, initialization, and the registered tool list.
