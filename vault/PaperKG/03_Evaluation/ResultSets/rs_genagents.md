---
id: rs_genagents
type: result_set
schema_version: 0.2.0
title: Generative Agents reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_evaluation]]'
tags:
  - paper-results
  - genagents
preferred_label: Generative Agents reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_genagents]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# Generative Agents reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_genagents_controlled]] | full architecture는 no-memory, no-reflection/no-planning, no-reflection ablation보다 전반적으로 높은 believability ranking을 얻었다. |
| [[bu_genagents_smallville]] | 출마 정보 4%→32%, party 정보 4%→52%, 관계 density 0.167→0.74, 초대자 12명 중 5명 참석. |

```paperkg-resultset
id: rs_genagents
rows:
  - benchmark_use: "[[bu_genagents_controlled]]"
    system: full Generative Agents architecture
    metric: "[[mt_believability_rank]]"
    unit: text
    baseline: false
    value_text: "ranked above no-memory and reflection/planning ablations overall"
    evidence_ref: "[[ev_genagents_evaluation]]"
  - benchmark_use: "[[bu_genagents_smallville]]"
    system: election information diffusion
    metric: "[[mt_social_outcomes]]"
    value: 32
    unit: percent
    baseline: false
    value_text: "4% to 32%"
    evidence_ref: "[[ev_genagents_evaluation]]"
  - benchmark_use: "[[bu_genagents_smallville]]"
    system: party information diffusion
    metric: "[[mt_social_outcomes]]"
    value: 52
    unit: percent
    baseline: false
    value_text: "4% to 52%"
    evidence_ref: "[[ev_genagents_evaluation]]"
  - benchmark_use: "[[bu_genagents_smallville]]"
    system: relationship density
    metric: "[[mt_social_outcomes]]"
    value: 0.74
    unit: fraction
    baseline: false
    value_text: "0.167 to 0.74"
    evidence_ref: "[[ev_genagents_evaluation]]"
  - benchmark_use: "[[bu_genagents_smallville]]"
    system: party attendance
    metric: "[[mt_social_outcomes]]"
    value: 5
    unit: count
    baseline: false
    value_text: "5 of 12 invited agents attended"
    evidence_ref: "[[ev_genagents_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 Generative Agents `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
