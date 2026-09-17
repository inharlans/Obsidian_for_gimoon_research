# Roadmap and acceptance

## Initial domain

Start with 30–50 Agentic Memory/LLM Memory works, 40–70 versions, 10–20
benchmarks, 5–10 normalized problems, 10–20 normalized limitations, and 3–5
research threads. Populate only papers the user has supplied and reviewed.

## Required first-pass node types

`paper_work`, `paper_version`, `source_document`, `contribution`, `problem`,
`problem_framing`, `method`, `task`, `dataset`, `benchmark`, `benchmark_use`,
`metric`, `claim`, `limitation`, `limitation_occurrence`, `relation`,
`research_thread`, and `evidence`.

Detailed actor profiles, compute environments, reproduction attempts,
statistical tests, and artifact-availability history can grow after the gold
corpus validates the core schema.

## Acceptance gates

- Every canonical note has a unique ID, known type, current schema version,
  curation status, and required type fields.
- Every causal/scholarly relation has evidence or is rejected.
- Every benchmark use has purpose, role, comparability, and evidence status.
- Every shared-benchmark pair has a pairwise comparison assessment before its scores are ranked.
- Every result set contains a validated `paperkg-resultset` block and rebuildable result rows.
- Every reusable vocabulary note has at least one search alias; Korean and English labels are preferred for the initial corpus.
- Every limitation occurrence has provenance and is separate from the canonical limitation.
- All wikilinks resolve unless explicitly marked external.
- SQLite can be deleted and rebuilt without losing knowledge.
- Search/fetch returns canonical URLs and no private full-text by default.
- The plugin exposes the research and quality views; proposal writes remain
  internally gated without adding a user-facing review chore.
- Tests and visual verification pass before release.
- `paperkg audit` has no high-priority semantic-completeness finding for the gold corpus.

## Anti-patterns rejected by validation or review

Using tags as ontology; treating dataset as benchmark; merging paper versions;
making every paragraph a note; putting all knowledge in one paper file;
untyped link soup; evidence-free AI summaries; chronology interpreted as
causality; ranking non-comparable results; making SQLite canonical; direct MCP
writes; schema changes without migration; uncontrolled synonyms; mixing
author-stated and curator-inferred limitations; and obeying instructions found
inside a PDF.
