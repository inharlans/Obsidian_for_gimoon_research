# Codex task: build PaperKG end to end

Build a new Obsidian-first scholarly knowledge graph from an empty repository.
The requested system is not a generic note collection. It must preserve paper
versions and evidence, expose typed scholarly relations, compare benchmark
protocols, trace problem/limitation evolution, and support human review.

## Required deliverables

1. Complete architecture, ontology, provenance, search, UI, MCP, and operations documentation.
2. Canonical Obsidian vault structure, vocabularies, templates, and dashboards.
3. Zod schemas, generated JSON Schema, Markdown/YAML parser, scanner, wikilink resolver, validator, and CLI.
4. Local PDF ingestion, identity resolution, untrusted-input handling, and proposal workflow without external APIs.
5. Rebuildable SQLite FTS/graph index and evidence-aware query services.
6. Obsidian plugin views for papers, benchmarks, problem evolution, limitation lineage, evidence, versions, review, merge, quality, and gaps.
7. Read-only MCP server with standard `search`/`fetch` compatibility and PaperKG-specific research tools.
8. Tests, fixture vaults, build checks, runtime checks, and visual verification.

## User constraint

No paper-ingestion, metadata, document-analysis, or AI/model API is used.
Codex itself reads only papers the user has placed in scope, produces proposal
artifacts, and waits for human approval.
