# PaperKG Hosted Connector Specification

## Value proposition

PaperKG is a canonical Markdown/YAML research knowledge graph that can be queried from ChatGPT anywhere and can receive structured meeting records from a separate recorder application.

Target users are the vault owner using ChatGPT and trusted companion applications acting on that owner's behalf. The current pain is that paper notes, evidence, benchmark protocols, limitations, and meeting conclusions are scattered across local tools and cannot be queried or updated through one evidence-aware interface.

Core actions:

1. Search, inspect, compare, and trace approved scholarly knowledge from ChatGPT.
2. Submit meeting transcripts and structured outcomes into a review inbox without promoting them to approved facts.
3. Synchronize the canonical vault to a continuously hosted service while preserving local Obsidian editing and Zotero references.

## Why an LLM interface

Natural-language questions such as "Which papers share this limitation, and are their benchmark results actually comparable?" map poorly to fixed UI filters but naturally to typed graph traversal plus evidence-aware synthesis.

The LLM contributes intent recognition, query composition, comparison, and explanation. It does not own the data, authenticate users, approve facts, or directly mutate canonical reviewed notes. PaperKG supplies the user's approved vault, typed relations, provenance, and safe proposal actions.

The meeting recorder does not receive free model inference through OAuth or a ChatGPT subscription. It submits already-produced transcripts or structured JSON. Any model used inside that separate application is outside PaperKG's deployment and billing boundary.

## User experience

### ChatGPT

The user connects a public PaperKG connector with OAuth. ChatGPT can resolve papers and aliases, search notes, compare methods and benchmarks, trace problem evolution, locate shared limitations, and retrieve claim evidence. Remote tools are read-only with respect to approved knowledge.

### Meeting recorder

The trusted recorder obtains an OAuth access token with a narrow meeting submission scope and sends an idempotent meeting envelope. PaperKG stores it as a candidate in the review inbox. A local Obsidian or CLI review action is required before any candidate becomes reviewed knowledge.

### Local knowledge work

The owner edits the canonical vault at `C:\Users\user\Documents\knowloge graph\vault\PaperKG`. `pnpm cloudflare:publish` builds a reviewed-only derived snapshot and publishes it to Cloudflare R2. The hosted Worker never mounts or edits the canonical vault. D1 receipts, R2 snapshots, and remote candidate objects remain disposable or reviewable derivatives rather than sources of truth.

## UX flows

### Research lookup in ChatGPT

1. Resolve a paper, entity, identifier, or alias.
2. Search approved notes and typed relations.
3. Compare papers, benchmark uses, claims, limitations, or version changes.
4. Return an evidence-aware answer package whose source notes can be inspected.

### Research lineage in ChatGPT

1. Select a problem, limitation, benchmark, or method.
2. Traverse reviewed typed relations and timestamps.
3. Return the evolution, unresolved gaps, and comparability warnings.

### Meeting submission

1. The recorder obtains a scoped OAuth token.
2. It submits one versioned, idempotent meeting envelope.
3. PaperKG validates and atomically stores a candidate inbox note.
4. The caller receives a receipt and review status; approval remains local.

These flows are tool-only in the first hosted release. The outputs are naturally conversational, and an embedded dashboard would duplicate the Obsidian plugin rather than improve the atomic ChatGPT actions.

## Hosted tools and HTTP actions

Read tools: `search_vault`, `read_note`, `get_backlinks`, `search_papers`, `get_paper`, `get_entity`, `get_benchmark_usage`, `compare_papers`, `trace_problem_evolution`, `find_shared_limitations`, `get_claim_evidence`, `get_version_diff`, and `build_paper_context`.

All read tools require `paperkg.read`; unredacted evidence requires `paperkg.evidence.read`. Tool results include stable IDs, curation status, and source references.

Meeting HTTP action: `POST /mcp/v1/meeting-ingestions` accepts the versioned envelope and an `Idempotency-Key`, requires `paperkg.meeting.submit`, and returns a receipt with candidate note ID, content hash, and review state. `GET /mcp/v1/meeting-ingestions/:receipt` returns status only to the same authorized subject.

Desktop companion applications discover OAuth metadata from the protected MCP resource, dynamically register their exact loopback redirect URI at `/oauth/register`, use authorization code with PKCE S256, and request only `paperkg.meeting.submit`. They must not request `openid` or `offline_access`; refresh-token support is discovered from authorization-server metadata.

Health, readiness, and OAuth protected-resource discovery are HTTP endpoints rather than LLM tools.

## Product context

- Canonical store: `vault/PaperKG/**/*.md` and YAML frontmatter.
- Existing implementation: TypeScript monorepo, validation CLI, SQLite/FTS index, read-only MCP tools, Obsidian plugin, and a curated Agentic Memory corpus.
- Primary transport: public HTTPS Streamable HTTP at `/mcp`.
- Authentication: OAuth 2.1 bearer access tokens validated by issuer, audience, signature, expiry, and scopes.
- ChatGPT scopes: `paperkg.read` and optional `paperkg.evidence.read`.
- Meeting scope: `paperkg.meeting.submit`.
- Approval scope: deliberately unavailable on the public server.
- User-facing local MCP: unsupported. Local transports may exist only as development/test harnesses.
- Model API dependency: none.
- Cloud implementation: Cloudflare Worker on a stable TLS hostname, OAuth provider grants in KV, single-use transient OAuth state and subject-bound idempotency receipts in D1, and approved derived snapshots plus untrusted candidates in R2.

## Knowledge and write boundaries

- Remote reads expose only reviewed or verified knowledge by default.
- Meeting submissions are untrusted input and become candidate inbox notes.
- A repeated idempotency key with identical content returns the existing receipt; different content is rejected.
- Meeting request bodies are rejected while streaming once they exceed 12 MB; protected responses are non-cacheable.
- Untrusted meeting text is rendered as inert Markdown/HTML-safe candidate content, and only validated entity IDs may become wikilinks.
- Remote clients cannot issue approval tokens or apply proposals to reviewed knowledge.
- Evidence and private attachment access require separate authorization and are denied by default.
- All canonical writes are atomic and preserve provenance.

## Meeting envelope

Envelope 1.0 remains accepted for existing clients. Envelope 1.1 additionally
preserves announcements, member progress/next steps, answered and unresolved
Q&A, research ideas, and presented-paper identifiers and slide references.
Every sourced item separates transcript segment, slide, and paper-section IDs;
all transcript references must resolve to unique segments included in the same
envelope. Missing optional analytical fields do not prevent raw candidate
ingestion.

Meeting-derived assertions retain the source meeting plus separate transcript,
slide, and paper-section references. Local promotion proposals create typed
meeting nodes but never merge a presented-paper claim into canonical scholarly
facts without a later evidence review.

## Synchronization strategy

The canonical vault remains local. A publish command validates Markdown, builds a reviewed-only JSON snapshot, and uploads that derived artifact to R2. Remote queries read the R2 snapshot; remote meeting submissions are isolated as R2 candidates plus D1 receipts and return through an idempotent Obsidian startup/background pull or the equivalent explicit CLI command. Pulling creates an inbox record and deterministic proposal only; canonical application remains a local approval action.

Google Drive for Desktop maintains an additive safety copy of the canonical vault for recovery and cross-device access. The Worker has no Google Drive credentials and never serves queries by reading Drive. Obsidian Sync or another sync engine may be introduced later, but only one engine may manage a given local vault path.

## Zotero and Google Drive

Zotero's database and full data directory must not be placed in Google Drive or any filesystem-sync folder. Zotero Data Sync remains the metadata/notes sync layer.

To avoid Zotero file-storage quotas, attachment PDFs may be converted to linked files stored in a Google Drive folder and addressed through Zotero's Linked Attachment Base Directory. This has cross-device and mobile/web limitations and requires a planned migration. PaperKG stores Zotero item keys and attachment paths/keys, not a second Zotero database.

No Zotero attachment is moved or relinked until the target Google Drive folder is explicitly selected and a migration manifest has been reviewed.

## Deployment acceptance criteria

- OAuth-protected `/mcp` with protected-resource metadata and correct bearer challenges.
- Per-tool scope enforcement and no token logging.
- OAuth-protected idempotent meeting ingestion endpoint with schema validation and atomic candidate writes.
- Primary OAuth completion remains available if optional callback auditing or encrypted redirect-recovery persistence is temporarily unavailable.
- Exact paper comparisons reject unknown or duplicate-resolved identifiers instead of silently omitting them; bounded results disclose actual truncation.
- Cloudflare Worker deployment with KV, R2, and D1 bindings; no canonical vault mount.
- Readiness/health endpoints and safe structured audit logs.
- Documentation for ChatGPT connection, OAuth provider setup, Obsidian synchronization, Google Drive alternatives, Zotero linked-file migration, backup, and recovery.
- Node unit tests plus real-workerd runtime tests, `pnpm audit --prod`, `pnpm check`, and production-vault validation pass.
