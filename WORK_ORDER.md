# Work order

## Scope

Create the PaperKG monorepo and a fresh `vault/PaperKG` vault in this empty Git
repository. No existing Obsidian vault was found, so there is nothing to delete.

## Files and systems

- Root workspace configuration and repository instructions.
- `docs/` for the complete blueprint and operating procedures.
- `packages/core` for ontology, parsing, validation, proposals, and queries.
- `packages/indexer` for SQLite FTS5/graph indexing.
- `packages/ingestion` for local PDF parsing and identity resolution.
- `packages/cli` for `paperkg` commands.
- `packages/mcp` for an OAuth-protected hosted MCP endpoint, candidate-only
  meeting ingestion, and development-only transports used by automated tests.
- `apps/obsidian-plugin` for the desktop knowledge-workspace UI.
- `apps/preview` for browser-based visual verification of the shared UI.
- `vault/PaperKG` for canonical Markdown/YAML, templates, vocabularies, and inboxes.
- `fixtures/` for valid and invalid test vaults.

## Assumptions

- Node.js 24 and bundled `pnpm` are available.
- Desktop Obsidian is the primary host; Markdown remains portable.
- The user supplies PDFs and any identifiers to preserve. Paper contents and
  metadata are never fetched from external services.
- PDF.js performs local text-layer parsing; Codex performs extraction and
  normalization from the supplied paper and parser output.
- Remote MCP is read-only, exposes only reviewed/verified notes, and does not
  expose private PDFs. Meeting writes are isolated to the candidate inbox.

## Risks

- Scholarly PDFs have inconsistent reading order and tables; parser output always remains a proposal input.
- Benchmark names are not sufficient for comparability; protocol fields may remain `unknown` until reviewed.
- Schema evolution can break old notes; migrations and `schema_version` are mandatory.
- A desktop plugin cannot safely assume the derived SQLite index exists; it falls back to Markdown metadata.

## Test plan

- Unit tests for schemas, wikilinks, identity resolution, proposal hashes, and comparability.
- Golden valid-vault validation and deliberately invalid fixtures.
- SQLite rebuild/search/graph query integration tests.
- MCP tool contract and HTTP smoke tests.
- Obsidian plugin and preview typecheck/build.
- Browser desktop/mobile interaction checks and concept/screenshot image inspection.

## Completion criteria

- `pnpm check` passes.
- `paperkg validate vault/PaperKG` reports no errors.
- A fresh index can be built and searched from Markdown.
- `/health` and `/mcp` start locally and MCP tool contracts are registered.
- The plugin bundle builds and the preview implements the accepted visual spec.
- Documentation explains local operation, ChatGPT connection, security, and future extension.

## Schema 0.2 reinforcement amendment

- Add semantic-completeness auditing alongside strict validation.
- Specialize high-value research and meeting-derived schemas.
- Store bilingual vocabulary aliases and agentic-memory comparison profiles.
- Add pairwise benchmark comparison assessments, explicit baseline nodes, and structured result rows.
- Add evidence-backed problem and limitation evolution relations without fabricating unavailable paper versions.
