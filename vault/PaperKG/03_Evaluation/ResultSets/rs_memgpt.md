---
id: rs_memgpt
type: result_set
schema_version: 0.2.0
title: MemGPT reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
tags:
  - paper-results
  - memgpt
preferred_label: MemGPT reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_memgpt]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# MemGPT reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_memgpt_dmr]] | GPT-3.5+MemGPT 66.9%, GPT-4+MemGPT 92.5%, GPT-4 Turbo+MemGPT 93.4% accuracy; 각각 base baseline보다 높다. |
| [[bu_memgpt_opener]] | 여러 base model의 MemGPT opener가 persona similarity에서 human-written opener와 비슷하거나 일부 기준에서 높다. |
| [[bu_memgpt_docqa]] | 고정-context baseline은 truncation이 커질수록 저하되지만 GPT-4 기반 MemGPT는 document count 증가에 더 안정적이다. |
| [[bu_memgpt_nested_kv]] | GPT-4+MemGPT는 nesting 증가에도 안정적인 반면 fixed GPT-4/4 Turbo는 3 nesting에서 0%에 도달한다. |

```paperkg-resultset
id: rs_memgpt
rows:
  - benchmark_use: "[[bu_memgpt_dmr]]"
    system: GPT-3.5 plus MemGPT
    metric: "[[mt_accuracy]]"
    value: 66.9
    unit: percent
    baseline: false
    value_text: "66.9%"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_dmr]]"
    system: GPT-4 plus MemGPT
    metric: "[[mt_accuracy]]"
    value: 92.5
    unit: percent
    baseline: false
    value_text: "92.5%"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_dmr]]"
    system: GPT-4 Turbo plus MemGPT
    metric: "[[mt_accuracy]]"
    value: 93.4
    unit: percent
    baseline: false
    value_text: "93.4%"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_opener]]"
    system: MemGPT conversation opener
    metric: "[[mt_csim]]"
    unit: text
    baseline: false
    value_text: "persona similarity is comparable to or above human-written openers on some criteria"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_docqa]]"
    system: GPT-4 plus MemGPT
    metric: "[[mt_accuracy]]"
    unit: text
    baseline: false
    value_text: "more stable than fixed-context control as document count increases"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_nested_kv]]"
    system: GPT-4 plus MemGPT
    metric: "[[mt_accuracy]]"
    unit: text
    baseline: false
    value_text: "remains stable as nesting increases"
    evidence_ref: "[[ev_memgpt_evaluation]]"
  - benchmark_use: "[[bu_memgpt_nested_kv]]"
    system: fixed GPT-4 or GPT-4 Turbo at nesting 3
    metric: "[[mt_accuracy]]"
    value: 0
    unit: percent
    baseline: true
    value_text: "0% at nesting level 3"
    evidence_ref: "[[ev_memgpt_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 MemGPT `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
