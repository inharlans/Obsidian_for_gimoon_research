# Architecture

## Canonical knowledge layer

Canonical material consists of reviewed Markdown notes, YAML properties,
typed relation notes, evidence blocks, controlled vocabularies, source-document
registries, and Git history. Canonical writes pass schema validation and use
atomic replacement.

Complex objects do not live as deeply nested frontmatter. Stable scalar and
short list metadata belongs in YAML; relationships with purpose, protocol,
confidence, provenance, or temporal scope become notes.

## Operational index

The derived SQLite database contains:

```text
notes, aliases, external_ids, properties, edges, evidence,
chunks, chunks_fts, embeddings, proposals, audit_log, index_state
```

The index supports exact identifiers and aliases first, then lexical FTS,
local vector retrieval, reciprocal-rank fusion, metadata filters, typed
expansion, and evidence-aware result packaging. The local vectors use a
deterministic hashed word/bigram/character-ngram representation. They require
no model download or embedding API and are always rebuildable from Markdown.

## Packages

- `@paperkg/core`: ontology, Markdown parsing, validation, proposals, queries.
- `@paperkg/indexer`: SQLite creation, incremental rebuild, search, graph reads.
- `@paperkg/ingestion`: local PDF parsing and identity resolution.
- `@paperkg/cli`: the `paperkg` executable.
- `@paperkg/mcp`: stdio and Streamable HTTP MCP transports.
- `apps/obsidian-plugin`: Markdown-native research UI.
- `apps/preview`: browser harness for the same visual system.

## Identity

Internal identifiers are immutable, opaque prefixes plus stable suffixes:

```text
pw_ PaperWork       pv_ PaperVersion      sd_ SourceDocument
pr_ Problem         pf_ ProblemFraming    me_ Method
bm_ Benchmark       bu_ BenchmarkUse      cl_ Claim
li_ Limitation      lo_ LimitationOccurrence
re_ Relation        ev_ Evidence          ri_ ResearchIdea
```

Filenames are human-readable but never identity. Renaming a file must not
change its `id`.

## Deployment boundaries

- Local Obsidian and CLI can read canonical notes and review proposals.
- Remote MCP reads approved metadata, summaries, and optionally evidence snippets.
- Private full-text PDFs are excluded from remote search by default.
- MCP never mints local approval tokens and never applies canonical writes.
