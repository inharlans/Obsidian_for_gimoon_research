---
id: rs_gmemory
type: result_set
schema_version: 0.2.0
title: G-Memory reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - paper-results
  - gmemory
preferred_label: G-Memory reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_gmemory]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# G-Memory reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_gmemory_alfworld]] | AutoGen+GPT-4o-mini에서 G-Memory 88.81로 no-memory 77.61보다 높으며 framework/backbone 전반에서 개선을 보고한다. |
| [[bu_gmemory_scienceworld]] | GPT-4o-mini에서 G-Memory가 AutoGen 67.40, DyLAN 65.64, MacNet 68.11을 보고한다. |
| [[bu_gmemory_pddl]] | full insight+interaction hierarchy가 두 ablation보다 높고 여러 MAS에서 no-memory를 상회한다. |
| [[bu_gmemory_hotpotqa]] | GPT-4o-mini에서 G-Memory는 AutoGen 35.67, DyLAN 34.69, MacNet 35.69를 보고한다. |
| [[bu_gmemory_fever]] | GPT-4o-mini에서 세 MAS 모두 no-memory보다 높은 exact-match 결과를 보고한다. |

```paperkg-resultset
id: rs_gmemory
rows:
  - benchmark_use: "[[bu_gmemory_alfworld]]"
    system: AutoGen plus G-Memory with GPT-4o-mini
    metric: "[[mt_success_rate]]"
    value: 88.81
    unit: percent
    baseline: false
    value_text: "88.81"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_alfworld]]"
    system: AutoGen no-memory with GPT-4o-mini
    metric: "[[mt_success_rate]]"
    value: 77.61
    unit: percent
    baseline: true
    value_text: "77.61"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_scienceworld]]"
    system: AutoGen plus G-Memory with GPT-4o-mini
    value: 67.40
    unit: score
    baseline: false
    value_text: "67.40"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_scienceworld]]"
    system: DyLAN plus G-Memory with GPT-4o-mini
    value: 65.64
    unit: score
    baseline: false
    value_text: "65.64"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_scienceworld]]"
    system: MacNet plus G-Memory with GPT-4o-mini
    value: 68.11
    unit: score
    baseline: false
    value_text: "68.11"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_pddl]]"
    system: full insight and interaction hierarchy
    unit: text
    baseline: false
    value_text: "outperforms both hierarchy ablations"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_hotpotqa]]"
    system: G-Memory across three MAS frameworks
    metric: "[[mt_exact_match]]"
    unit: text
    baseline: false
    value_text: "AutoGen 35.67; DyLAN 34.69; MacNet 35.69"
    evidence_ref: "[[ev_gmemory_evaluation]]"
  - benchmark_use: "[[bu_gmemory_fever]]"
    system: G-Memory across three MAS frameworks
    metric: "[[mt_exact_match]]"
    unit: text
    baseline: false
    value_text: "all three MAS settings exceed their no-memory controls"
    evidence_ref: "[[ev_gmemory_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 G-Memory `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
