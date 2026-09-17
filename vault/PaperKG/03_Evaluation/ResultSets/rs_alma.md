---
id: rs_alma
type: result_set
schema_version: 0.2.0
title: ALMA reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_evaluation]]'
tags:
  - paper-results
  - alma
preferred_label: ALMA reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_alma]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# ALMA reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_alma_alfworld]] | GPT-5-mini static test 87.1±1.4; dynamic valid-seen→valid-unseen adaptation 84.1%. |
| [[bu_alma_textworld]] | GPT-5-mini transfer에서 ALMA 75.0±2.3으로 manual baselines와 no-memory를 상회한다. |
| [[bu_alma_baba]] | GPT-5-mini transfer에서 ALMA 33.3±2.4; learned design은 rule-aware strategy switching 등을 포함한다. |
| [[bu_alma_minihack]] | GPT-5-mini transfer에서 ALMA 20.0±2.9로 비교군 중 최고이며 reflex rules와 risk memory가 발견된다. |

```paperkg-resultset
id: rs_alma
rows:
  - benchmark_use: "[[bu_alma_alfworld]]"
    system: ALMA static test
    metric: "[[mt_success_rate]]"
    value: 87.1
    unit: percent
    dispersion: 1.4
    dispersion_kind: se
    baseline: false
    value_text: "GPT-5-mini static test 87.1±1.4"
    evidence_ref: "[[ev_alma_evaluation]]"
  - benchmark_use: "[[bu_alma_alfworld]]"
    system: ALMA dynamic adaptation
    metric: "[[mt_success_rate]]"
    value: 84.1
    unit: percent
    baseline: false
    value_text: "valid-seen to valid-unseen adaptation 84.1%"
    evidence_ref: "[[ev_alma_evaluation]]"
  - benchmark_use: "[[bu_alma_textworld]]"
    system: ALMA transfer
    metric: "[[mt_success_rate]]"
    value: 75.0
    unit: percent
    dispersion: 2.3
    dispersion_kind: se
    baseline: false
    value_text: "75.0±2.3"
    evidence_ref: "[[ev_alma_evaluation]]"
  - benchmark_use: "[[bu_alma_baba]]"
    system: ALMA transfer
    metric: "[[mt_success_rate]]"
    value: 33.3
    unit: percent
    dispersion: 2.4
    dispersion_kind: se
    baseline: false
    value_text: "33.3±2.4"
    evidence_ref: "[[ev_alma_evaluation]]"
  - benchmark_use: "[[bu_alma_minihack]]"
    system: ALMA transfer
    metric: "[[mt_success_rate]]"
    value: 20.0
    unit: percent
    dispersion: 2.9
    dispersion_kind: se
    baseline: false
    value_text: "20.0±2.9"
    evidence_ref: "[[ev_alma_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 ALMA `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
