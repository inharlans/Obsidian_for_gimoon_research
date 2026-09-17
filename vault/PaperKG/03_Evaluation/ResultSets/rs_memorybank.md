---
id: rs_memorybank
type: result_set
schema_version: 0.2.0
title: MemoryBank reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memorybank_evaluation]]'
tags:
  - paper-results
  - memorybank
preferred_label: MemoryBank reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_memorybank]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# MemoryBank reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_memorybank_probe]] | ChatGPT variant는 영어 correctness 0.716, coherence 0.912, ranking 0.818; 중국어 correctness 0.655, coherence 0.675, ranking 0.758을 보고한다. |

```paperkg-resultset
id: rs_memorybank
rows:
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT English
    metric: "[[mt_response_correctness]]"
    value: 0.716
    unit: fraction
    baseline: false
    value_text: "English correctness 0.716"
    evidence_ref: "[[ev_memorybank_evaluation]]"
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT English
    metric: "[[mt_contextual_coherence]]"
    value: 0.912
    unit: fraction
    baseline: false
    value_text: "English coherence 0.912"
    evidence_ref: "[[ev_memorybank_evaluation]]"
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT English
    metric: "[[mt_model_ranking]]"
    value: 0.818
    unit: fraction
    baseline: false
    value_text: "English ranking 0.818"
    evidence_ref: "[[ev_memorybank_evaluation]]"
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT Chinese
    metric: "[[mt_response_correctness]]"
    value: 0.655
    unit: fraction
    baseline: false
    value_text: "Chinese correctness 0.655"
    evidence_ref: "[[ev_memorybank_evaluation]]"
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT Chinese
    metric: "[[mt_contextual_coherence]]"
    value: 0.675
    unit: fraction
    baseline: false
    value_text: "Chinese coherence 0.675"
    evidence_ref: "[[ev_memorybank_evaluation]]"
  - benchmark_use: "[[bu_memorybank_probe]]"
    system: MemoryBank ChatGPT Chinese
    metric: "[[mt_model_ranking]]"
    value: 0.758
    unit: fraction
    baseline: false
    value_text: "Chinese ranking 0.758"
    evidence_ref: "[[ev_memorybank_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 MemoryBank `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
