# MCP and security

## Archetype

The ChatGPT integration is a `tool-only` knowledge source. Custom ChatGPT UI is
not required because visual editing and review happen in Obsidian. The MCP
server remains useful in ChatGPT, Codex, and deep-research-style clients.

## Standard tools

`search(query)` and `fetch(id)` provide the standard read path used by ChatGPT
company-knowledge style retrieval. They are read-only and return bounded JSON
inside MCP text content. PaperKG-specific tools expose typed scholarly queries.

## PaperKG tools

`search_papers`, `get_paper`, `get_entity`, `get_benchmark_usage`,
`compare_papers`, `trace_problem_evolution`, `find_shared_limitations`,
`get_claim_evidence`, `get_version_diff`, and `build_paper_context` are focused,
read-only tools with explicit schemas and annotations.

MCP has no tool that mints an approval token or applies a canonical patch.
Meeting ingestion is a separate OAuth-protected HTTP action under
`/mcp/v1/meeting-ingestions`. It stores only remote candidates; a local pull
and human review are required before canonical Markdown changes.

## Data scopes

| Material | Remote default |
| --- | --- |
| approved metadata | allowed |
| approved summaries | allowed |
| evidence snippets | opt-in |
| full private PDF | blocked |
| proposal creation | local only by default |
| canonical direct write | blocked |

## Hosted transport

- The supported user transport is public HTTPS Streamable HTTP at `/mcp`.
- Stdio and no-auth HTTP exist only for automated development tests.
- A temporary tunnel is not a production or anywhere-access deployment.
- Cloudflare's OAuth provider validates bearer tokens, resource audience,
  expiry, client and PKCE before protected handlers run. GitHub authenticates
  the allowlisted vault owner; the Worker issues its own MCP tokens.
- Production hosting provides TLS, Streamable HTTP, RFC 9728 protected-resource
  metadata, OAuth authorization-server metadata, KV/R2/D1 storage, and logs.
- Read results are restricted to `reviewed` and `verified` knowledge. Evidence
  requires `paperkg.evidence.read`.
- The default lexical index is built from redacted summaries. Full approved
  body text participates in search only when the access token also carries
  `paperkg.evidence.read`, preventing an evidence-presence search oracle.
- An evidence note fetched without that scope returns only identity and
  curation fields. Its frontmatter summary, source location, support targets,
  and body are withheld together, so standard `search`/`fetch` cannot bypass
  the evidence tool policy.

## Tool safety

All read tools set `readOnlyHint: true`, `destructiveHint: false`, and
`openWorldHint: false`. The remote server reads a filtered R2 snapshot and has
no local vault path.
Input limits prevent unbounded graph and text retrieval. Tool descriptions
state user intent and do not expose internal implementation details.
Paper comparisons fail explicitly when any requested identifier is unknown or
when multiple identifiers resolve to the same work. Bounded tool outputs mark
`truncated` only when additional undisclosed items actually exist.

Node tests cover pure request and query logic. A separate Cloudflare Vitest
suite runs cryptography and streaming-body limits inside the real `workerd`
runtime so Node compatibility shims cannot hide deployment-only failures.

## Documentation basis

Implementation follows the current official OpenAI guidance for
[building an MCP server](https://developers.openai.com/apps-sdk/build/mcp-server/),
[tool design](https://developers.openai.com/apps-sdk/plan/tools/), and
[MCP `search`/`fetch` compatibility](https://developers.openai.com/api/docs/mcp).

Deployment and OAuth configuration are specified in
`docs/09-hosted-deployment.md`; the recorder contract is in
`docs/10-meeting-app-integration.md`.
