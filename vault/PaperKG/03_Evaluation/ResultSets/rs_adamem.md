---
id: rs_adamem
type: result_set
schema_version: 0.2.0
title: AdaMEM reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
tags:
  - paper-results
  - adamem
preferred_label: AdaMEM reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_adamem]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# AdaMEM reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_adamem_alfworld]] | training-free on-policy AdaMEM-LOW: seen 54.0±2.9, unseen 58.2±3.9. STEP-MFT 계열은 추가 향상을 보고한다. |
| [[bu_adamem_webshop]] | on-policy AdaMEM-LOW Task Score 74.2±0.3; static Synapse와 ReasoningBank의 negative transfer를 역전했다고 분석한다. |
| [[bu_adamem_hotpotqa]] | AdaMEM 41.1±0.5, ReasoningBank 40.5±0.8, Synapse 40.4±0.2, no-memory 39.7±1.9. |

```paperkg-resultset
id: rs_adamem
rows:
  - benchmark_use: "[[bu_adamem_alfworld]]"
    system: AdaMEM-LOW seen
    metric: "[[mt_success_rate]]"
    value: 54.0
    unit: percent
    dispersion: 2.9
    dispersion_kind: sd
    baseline: false
    value_text: "seen 54.0±2.9"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_alfworld]]"
    system: AdaMEM-LOW unseen
    metric: "[[mt_success_rate]]"
    value: 58.2
    unit: percent
    dispersion: 3.9
    dispersion_kind: sd
    baseline: false
    value_text: "unseen 58.2±3.9"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_webshop]]"
    system: AdaMEM-LOW
    metric: "[[mt_task_score]]"
    value: 74.2
    unit: score
    dispersion: 0.3
    dispersion_kind: sd
    baseline: false
    value_text: "Task Score 74.2±0.3"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_hotpotqa]]"
    system: AdaMEM
    value: 41.1
    unit: score
    dispersion: 0.5
    dispersion_kind: sd
    baseline: false
    value_text: "41.1±0.5"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_hotpotqa]]"
    system: ReasoningBank
    value: 40.5
    unit: score
    dispersion: 0.8
    dispersion_kind: sd
    baseline: true
    value_text: "40.5±0.8"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_hotpotqa]]"
    system: Synapse
    value: 40.4
    unit: score
    dispersion: 0.2
    dispersion_kind: sd
    baseline: true
    value_text: "40.4±0.2"
    evidence_ref: "[[ev_adamem_evaluation]]"
  - benchmark_use: "[[bu_adamem_hotpotqa]]"
    system: no-memory
    value: 39.7
    unit: score
    dispersion: 1.9
    dispersion_kind: sd
    baseline: true
    value_text: "39.7±1.9"
    evidence_ref: "[[ev_adamem_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 AdaMEM `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
