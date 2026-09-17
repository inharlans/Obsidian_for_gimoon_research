# PaperKG

PaperKG is an Obsidian-first scholarly knowledge graph for evidence-grounded
paper reading, comparison, and research synthesis. Markdown/YAML is canonical;
SQLite and MCP are rebuildable interfaces.

## What is implemented

- Work/version/source separation for scholarly records.
- Typed problem, method, benchmark, claim, limitation, and evidence nodes.
- Pairwise benchmark comparability assessments, explicit baselines, and structured result rows.
- Vault validation, semantic-completeness audit, and inspection CLI.
- Local PDF ingestion and Codex proposal workflow with no AI API.
- Rebuildable SQLite FTS5 and typed-edge index.
- Obsidian research workspace and browser preview.
- OAuth-protected hosted MCP `search`/`fetch`, paper comparison, and graph-trace tools.
- Idempotent OAuth meeting ingestion into a candidate-only review inbox.
- Container deployment, cloud-vault synchronization, and Zotero/Google Drive migration guidance.

## Quick start

```powershell
pnpm install
pnpm build
pnpm paperkg validate vault/PaperKG
pnpm paperkg audit vault/PaperKG
pnpm paperkg index --vault vault/PaperKG
pnpm paperkg search "memory evolution" --vault vault/PaperKG
pnpm paperkg benchmark-comparison bm_alfworld --vault vault/PaperKG
pnpm cloudflare:check-account-switch
pnpm dev:preview
```

For the complete operating model, start with [the blueprint](docs/00-blueprint.md),
[the app-developer handoff](DEVELOPER_HANDOFF.md),
[hosted deployment](docs/09-hosted-deployment.md),
[meeting-app contract](docs/10-meeting-app-integration.md), and
[Zotero/Google Drive guide](docs/11-zotero-google-drive.md). The exact machine
installation state and remaining human checkpoints are recorded in
[the live setup status](docs/12-live-installation-status.md).

## Canonical-data rule

Only approved Markdown/YAML under `vault/PaperKG` is knowledge. The database,
PDF text, embeddings, caches, and proposal artifacts can be discarded and
rebuilt. Paper ingestion, extraction, and normalization use no external API;
Codex analyzes only the papers the user explicitly supplies.
