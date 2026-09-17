# Ontology and granularity

## Bibliographic layer

| Type | Meaning |
| --- | --- |
| `paper_work` | one intellectual work across versions |
| `paper_version` | arXiv revision, venue paper, or journal extension |
| `source_document` | a concrete PDF, HTML, TEI, or extracted file |
| `author`, `organization` | actors with stable external identifiers when known |
| `venue_series`, `venue_event` | series and dated event |
| `artifact` | code, model, dataset release, prompt, or environment |

Never overwrite arXiv content with a venue version. A `paper_work` points to a
canonical version while preserving all versions and source hashes.

## Contribution layer

`contribution`, `problem`, `problem_framing`, `research_question`, `claim`,
`method`, `system`, `component`, `assumption`, `conclusion`, and `future_work`
capture what the authors say and what the curator infers.

`problem` is normalized across papers. `problem_framing` is version-specific
and preserves the language, cause, scope, and evidence used by one paper.

## Evaluation layer

`task`, `dataset`, `benchmark`, `benchmark_use`, `protocol`, `metric`,
`baseline`, `experiment`, `result_set`, `comparison_assessment`, `ablation`, `error_analysis`, and
`reproduction_attempt` separate data resources from evaluation configurations.

A benchmark is not a dataset name. It is the task, dataset release, split,
preprocessing, protocol, metric, and scoring implementation. `benchmark_use`
records why and how one paper version used it.

Each `benchmark_use` has a deterministic configuration fingerprint over its
dataset version, splits, protocols, and metrics. Direct comparability is not an
intrinsic property of one use: a `comparison_assessment` records the reviewed
status and differing fields for a pair of uses. Dense numeric results live in a
validated `paperkg-resultset` block and are indexed as rows.

## Structural ownership and scholarly relations

Containment such as Claim → PaperVersion is recorded by a required owner field
and rebuilt as a `part_of_version` edge. These mechanical edges do not require a
separate relation note. Claims such as `reframes`, `partially_addresses`, or
`contradicts` remain canonical Relation notes with evidence and confidence.

## Source-document roles

`source_document` distinguishes `original`, `translated`,
`bilingual_alternating`, `parsed_text`, and `ocr`. Derived documents record
their language and `derived_from` source. Scholarly evidence is grounded in the
original version; translated documents are reading aids unless separately
reviewed against the original.

## Critique and synthesis

`limitation` is a normalized recurring issue. `limitation_occurrence` records
its scope and origin in a specific paper version. `threat_to_validity`,
`research_thread`, `relation`, and `research_idea` support synthesis without
mixing hypotheses with approved facts.

## Promotion rule

Create a separate note if any condition holds:

1. it is reused or compared in two or more papers;
2. it needs independent search, filtering, or timeline placement;
3. it has version, status, source, or provenance;
4. the relationship needs purpose, role, protocol, confidence, or evidence;
5. a curator explicitly promotes it as a domain concept.

Otherwise keep it in the paper hub's stable headings.

## Paper hub headings

Every paper version uses: one-sentence contribution; original/translated/
structured abstract; problem and motivation; contributions; method;
evaluation; results; limitations and threats; related-work relations; version
history; evidence ledger; curator interpretation; open questions and ideas.

## Domain profiles

The universal core can be augmented by profiles. The initial `agentic-memory`
profile compares memory unit, write policy, representation, organization,
linking, update/evolution trigger, consolidation, pruning, retrieval, reranking,
temporal handling, online/offline operation, evidence preservation, conflict
resolution, complexity, and benchmarks.

The initial method nodes store reviewed profile values directly in a flat
`profile` map so comparison works without creating one note per profile field.
