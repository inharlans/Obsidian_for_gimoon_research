# Search, comparison, and synthesis

## Retrieval order

1. exact internal/external identifier, title, citekey, and alias;
2. lexical FTS by section;
3. deterministic local vector retrieval;
4. typed graph expansion for the question;
5. metadata filters;
6. reciprocal-rank fusion;
7. evidence and curation-aware reranking;
8. an answer package containing source notes and evidence references.

Exact alias resolution always precedes fuzzy or semantic retrieval, so a query
such as `A-MEM` resolves the paper card before similar text chunks.

## Typed paths

- Benchmark use: `paper_work -> paper_version -> benchmark_use -> benchmark -> protocol/metric/result_set`.
- Shared limitation: `paper_version -> limitation_occurrence -> limitation -> other occurrences -> versions`.
- Problem evolution: `problem -> problem_framing -> paper_version` plus reviewed typed relations.
- Coverage gap: `method -> papers -> benchmark_uses -> domain benchmark registry -> missing combinations`.

## Comparability

`exact` requires the same dataset release, split/subset, preprocessing, prompt
and examples, evaluator/version, metric implementation, access date, trial
count, and aggregation. `partial` means important differences remain;
`not_comparable` means direct score ranking is invalid; `unknown` means the
paper or review lacks enough detail.

The coarse `benchmark_use.comparability_status` is retained for compatibility
and local warnings. Actual score ranking uses the pairwise
`comparison_assessment` for the two uses being compared. A configuration hash
that differs proves the uses are not exact; a matching hash is only a candidate
for exactness until the scorer, model access date, and other reviewed details
also agree.

The query layer never declares one paper better solely from a larger score
unless the relevant pairwise assessment is `exact`. `paperkg
benchmark-comparison <benchmark-id>` returns uses, assessments, and structured
result rows together.

## Research-gap reports

- limitations with at least three occurrences and no verified address relation;
- method–benchmark combinations absent from a domain profile;
- same benchmark name with incompatible protocols;
- contradictory claims with evidence under different protocols;
- old limitations reappearing under new terminology;
- limitations removed between versions without supporting changes.

Generated ideas are `research_idea` notes with `machine_suggested` status and
`derived_from` evidence. They are not knowledge facts until reviewed.

## Semantic completeness

`paperkg validate` checks schema, IDs, links, predicate ranges, and required
evidence. `paperkg audit` separately measures research usefulness: baseline
coverage, structured result rows, pairwise comparison coverage, evolution
relations, source provenance, and bilingual vocabulary aliases. A vault may be
syntactically valid while still having audit findings.
