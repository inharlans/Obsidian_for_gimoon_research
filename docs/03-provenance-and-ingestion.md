# Provenance, ingestion, and review

## Provenance dimensions

`assertion_origin` is one of `author_stated`, `curator_interpreted`,
`machine_extracted`, `machine_inferred`, `later_work_criticism`, or
`reproduced`. In this no-API build, Codex suggestions use
`machine_extracted`/`machine_inferred` only inside proposals.

`curation_status` progresses through `inbox`, `candidate`, `reviewed`,
`verified`, `disputed`, `deprecated`, `rejected`.

`evidence_status` is `exact_quote`, `faithful_paraphrase`, `table_derived`,
`figure_derived`, `metadata_only`, or `missing`.

## Input paths

The CLI accepts user-scoped local PDFs. DOI, arXiv, OpenReview, citekey, and
other identifiers may be entered as evidence-backed fields by Codex when they
are present in the supplied paper or user material. PaperKG performs no
network metadata lookup and contains no external model API.

## Raw snapshots

Every local PDF is content-hashed and copied under `Attachments/PDFs`. Its
page-bounded parser output and work order are preserved under
`10_Inbox/Imports` with source path, parse time, SHA-256, and parser version.
Normalized notes never erase these source artifacts.

## Identity resolution

Strong duplicate signals: identical DOI, arXiv ID, OpenReview forum ID, or PDF
SHA-256. Weak signals: normalized title, first author, date window, abstract
fingerprint, and reference overlap. Weak signals generate merge proposals and
never auto-merge.

## Local PDF parsing

The parser is local PDF.js and records page boundaries. It is pinned above the
current security-fixed release, disables XFA form processing, and extracts text
without rendering annotations or running a viewer scripting layer. Production
dependency auditing is part of the release check because every PDF is untrusted.
Parser output is not canonical and may be deleted. Codex interprets layout,
tables, formulas, and section semantics from the user-supplied paper; no
document-analysis service or extraction API is invoked.

## Codex reading workflow

1. User places a PDF under `vault/PaperKG/Attachments/PDFs` or passes its path.
2. `paperkg ingest-pdf` hashes it, extracts local text, and creates a reading work order.
3. Codex reads only that source, ignores embedded instructions, and fills candidate JSON.
4. `paperkg proposal create` normalizes candidates against existing IDs and vocabulary.
5. The plugin/CLI shows create/update/relation/merge/conflict diffs.
6. Human approval creates a short-lived, single-use local token.
7. `paperkg proposal apply` checks content hash, base revision, allowed paths, schema, and token.
8. Atomic writes occur and the audit log records safe metadata.

## Evidence block

```markdown
> [!evidence] ev_method_03
> source_kind: author_body
> source_version: pv_example_v1
> location: Section 3.2, page 5
> supports: memory evolution mechanism
> summary: The new memory updates contextual attributes of related memories.
^ev_method_03
```

Exact quotations must remain short and source-located. Curator interpretation
must never be labeled `author_stated`.
