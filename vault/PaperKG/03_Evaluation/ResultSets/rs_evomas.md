---
id: rs_evomas
type: result_set
schema_version: 0.2.0
title: EvoMAS reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_evaluation]]'
tags:
  - paper-results
  - evomas
preferred_label: EvoMAS reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_evomas]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# EvoMAS reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_evomas_bbeh]] | EvoAgent 대비 +10.5 point; backbone별 BBEH-Mini에서 prior automatic generators를 상회한다. |
| [[bu_evomas_swe_lite]] | Claude-3.5-Sonnet 33.9%, Qwen3-235B 48.2%, Qwen3-480B 57.6%로 표에 보고된다. |
| [[bu_evomas_swe_verified]] | Claude-4.5-Sonnet 조건에서 79.1%; 동일 31M-token loop 71.4%보다 높다. |
| [[bu_evomas_workbench]] | EvoAgent보다 +7.1 point; calendar domain은 높고 project-management domain은 낮아 tool orchestration 난이도 차이를 보인다. |

```paperkg-resultset
id: rs_evomas
rows:
  - benchmark_use: "[[bu_evomas_bbeh]]"
    system: EvoMAS improvement over EvoAgent
    metric: "[[mt_accuracy]]"
    value: 10.5
    unit: points
    baseline: false
    value_text: "+10.5 points over EvoAgent"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_swe_lite]]"
    system: EvoMAS with Claude-3.5-Sonnet
    metric: "[[mt_resolved_rate]]"
    value: 33.9
    unit: percent
    baseline: false
    value_text: "33.9%"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_swe_lite]]"
    system: EvoMAS with Qwen3-235B
    metric: "[[mt_resolved_rate]]"
    value: 48.2
    unit: percent
    baseline: false
    value_text: "48.2%"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_swe_lite]]"
    system: EvoMAS with Qwen3-480B
    metric: "[[mt_resolved_rate]]"
    value: 57.6
    unit: percent
    baseline: false
    value_text: "57.6%"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_swe_verified]]"
    system: EvoMAS with Claude-4.5-Sonnet
    metric: "[[mt_resolved_rate]]"
    value: 79.1
    unit: percent
    baseline: false
    value_text: "79.1%"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_swe_verified]]"
    system: fixed 31M-token loop
    metric: "[[mt_resolved_rate]]"
    value: 71.4
    unit: percent
    baseline: true
    value_text: "71.4%"
    evidence_ref: "[[ev_evomas_evaluation]]"
  - benchmark_use: "[[bu_evomas_workbench]]"
    system: EvoMAS improvement over EvoAgent
    metric: "[[mt_accuracy]]"
    value: 7.1
    unit: points
    baseline: false
    value_text: "+7.1 points over EvoAgent"
    evidence_ref: "[[ev_evomas_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 EvoMAS `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
