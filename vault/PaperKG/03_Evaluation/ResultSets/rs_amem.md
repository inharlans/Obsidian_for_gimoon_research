---
id: rs_amem
type: result_set
schema_version: 0.2.0
title: A-MEM reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_evaluation]]'
tags:
  - paper-results
  - amem
preferred_label: A-MEM reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_amem]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# A-MEM reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_amem_locomo]] | A-MEM은 non-GPT model 전반과 multi-hop/temporal category에서 강한 향상을 보고하며 table에는 model·category별 점수가 분리되어 있다. |
| [[bu_amem_dialsim]] | A-MEM F1 3.45, BLEU-1 3.37, ROUGE-L 3.54; LoCoMo와 MemGPT baseline보다 높게 보고되었다. |

```paperkg-resultset
id: rs_amem
rows:
  - benchmark_use: "[[bu_amem_locomo]]"
    system: A-MEM
    unit: text
    baseline: false
    value_text: "non-GPT models and multi-hop/temporal categories show strong paper-reported gains"
    evidence_ref: "[[ev_amem_evaluation]]"
  - benchmark_use: "[[bu_amem_dialsim]]"
    system: A-MEM
    metric: "[[mt_f1]]"
    value: 3.45
    unit: score
    baseline: false
    value_text: "F1 3.45"
    evidence_ref: "[[ev_amem_evaluation]]"
  - benchmark_use: "[[bu_amem_dialsim]]"
    system: A-MEM
    metric: "[[mt_bleu1]]"
    value: 3.37
    unit: score
    baseline: false
    value_text: "BLEU-1 3.37"
    evidence_ref: "[[ev_amem_evaluation]]"
  - benchmark_use: "[[bu_amem_dialsim]]"
    system: A-MEM
    metric: "[[mt_rougel]]"
    value: 3.54
    unit: score
    baseline: false
    value_text: "ROUGE-L 3.54"
    evidence_ref: "[[ev_amem_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 A-MEM `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
