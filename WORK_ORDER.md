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

## Faceted memory-taxonomy amendment (2026-09-17)

Full rationale, derivation table, and remaining follow-ups are in
`docs/13-memory-taxonomy-facets.md` — read it before touching Method notes
or Problem-node normalization.

- Added a controlled facet vocabulary (`agent_scope`, `memory_target_category`,
  `design_origin`) so cross-paper filtering of Method notes does not depend
  on re-reading free-text `profile` fields. This is additive to the existing
  `agentic-memory-profile.yaml` fields, not a replacement.
- Added `shares_design_facet` to `predicates.yaml`'s `method` category for
  curator-interpreted, method-to-method structural overlap — distinct from
  `compares_against` (empirical) and `extends_method` (lineage).
- Retrofitted the 9 existing Method notes with the three facet fields and
  proposed 3 `curation_status: candidate` relations from genuine facet
  overlap. Not yet human-approved to `reviewed`.
## ChatGPT Drive write-back amendment (2026-09-17)

Full findings in `docs/14-chatgpt-drive-writeback.md`. Read it before touching
the Drive sync or `vault/PaperKG/AGENTS.md`.

- ChatGPT proposes by **appending to `10_Inbox/ReviewQueue/INBOX.md`**; a human
  then runs *Pull from Google Drive* in Obsidian. Verified end to end.
- It must not create files in Drive: the sync plugin's OAuth scope is
  `drive.file`, so anything it did not create itself is permanently invisible
  and would never reach the vault.
- Drive→local pull is automatic only because the plugin's `main.js` carries a
  local patch (`paperkg-local-patch`) adding a 5-minute pull timer. A plugin
  update removes it silently — re-apply it if you ever update.

## Faceted memory-taxonomy amendment, continued

- Did not: normalize `online_or_offline` free text, change
  `frontmatter.schema.json` requiredness (validator could not be run in the
  environment this was done in — verify with `pnpm paperkg validate` and
  `pnpm paperkg audit` next session), delete the 8 stale
  `paper_import_work_order` leftovers in `10_Inbox/Imports/`, or
  re-normalize single-paper `Problem` nodes against the existing promotion
  rule in `docs/02-ontology.md`.
