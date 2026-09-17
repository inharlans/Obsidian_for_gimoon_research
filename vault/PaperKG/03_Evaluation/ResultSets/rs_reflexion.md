---
id: rs_reflexion
type: result_set
schema_version: 0.2.0
title: Reflexion reviewed result set
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - paper-results
  - reflexion
preferred_label: Reflexion reviewed result set
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_reflexion]]'
assertion_origin: author_stated
evidence_status: table_derived
structured_rows: true
---

# Reflexion reviewed result set

## 정의

논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.

## Results by benchmark use

| BenchmarkUse | Reviewed result |
|---|---|
| [[bu_reflexion_alfworld]] | ReAct+Reflexion heuristic evaluator가 130/134 task를 해결하고 baseline은 trial 6–7 사이 개선이 정체된다. |
| [[bu_reflexion_hotpotqa]] | CoT(GT)+Reflexion은 baseline 대비 14% 개선하고 episodic replay 대비 self-reflection이 8% absolute boost를 제공한다. |
| [[bu_reflexion_humaneval_py]] | Reflexion 91.0% pass@1, paper가 인용한 GPT-4 baseline 80.1%. |
| [[bu_reflexion_humaneval_rs]] | Reflexion 68.0%, GPT-4 baseline 60.0%; ablation에서 test 또는 reflection 제거 시 full variant보다 낮다. |
| [[bu_reflexion_mbpp_py]] | Reflexion 77.1%로 paper의 GPT-4 baseline 80.1%보다 낮고, test false-positive 16.3%가 주요 원인으로 분석된다. |
| [[bu_reflexion_mbpp_rs]] | Reflexion 75.4%, GPT-4 baseline 70.9%. |
| [[bu_reflexion_leetcode]] | Reflexion 15.0%, GPT-4 baseline 7.5%. |
| [[bu_reflexion_webshop]] | ReAct+Reflexion이 ReAct보다 유의하게 개선되지 않아 다양성과 exploration이 필요한 검색에서 한계를 보였다. |

```paperkg-resultset
id: rs_reflexion
rows:
  - benchmark_use: "[[bu_reflexion_alfworld]]"
    system: ReAct plus Reflexion
    metric: "[[mt_success_rate]]"
    value: 130
    unit: count
    baseline: false
    value_text: "130 of 134 tasks solved"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_hotpotqa]]"
    system: CoT(GT) plus Reflexion improvement
    metric: "[[mt_success_rate]]"
    value: 14
    unit: percent
    baseline: false
    value_text: "14% improvement over baseline"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_hotpotqa]]"
    system: self-reflection over episodic replay
    metric: "[[mt_success_rate]]"
    value: 8
    unit: points
    baseline: false
    value_text: "8 percentage-point absolute boost"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_humaneval_py]]"
    system: Reflexion
    metric: "[[mt_pass_at_1]]"
    value: 91.0
    unit: percent
    baseline: false
    value_text: "91.0%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_humaneval_py]]"
    system: GPT-4 paper baseline
    metric: "[[mt_pass_at_1]]"
    value: 80.1
    unit: percent
    baseline: true
    value_text: "80.1%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_humaneval_rs]]"
    system: Reflexion
    metric: "[[mt_pass_at_1]]"
    value: 68.0
    unit: percent
    baseline: false
    value_text: "68.0%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_humaneval_rs]]"
    system: GPT-4 paper baseline
    metric: "[[mt_pass_at_1]]"
    value: 60.0
    unit: percent
    baseline: true
    value_text: "60.0%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_mbpp_py]]"
    system: Reflexion
    metric: "[[mt_pass_at_1]]"
    value: 77.1
    unit: percent
    baseline: false
    value_text: "77.1%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_mbpp_py]]"
    system: GPT-4 paper baseline
    metric: "[[mt_pass_at_1]]"
    value: 80.1
    unit: percent
    baseline: true
    value_text: "80.1%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_mbpp_rs]]"
    system: Reflexion
    metric: "[[mt_pass_at_1]]"
    value: 75.4
    unit: percent
    baseline: false
    value_text: "75.4%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_mbpp_rs]]"
    system: GPT-4 paper baseline
    metric: "[[mt_pass_at_1]]"
    value: 70.9
    unit: percent
    baseline: true
    value_text: "70.9%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_leetcode]]"
    system: Reflexion
    metric: "[[mt_pass_at_1]]"
    value: 15.0
    unit: percent
    baseline: false
    value_text: "15.0%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_leetcode]]"
    system: GPT-4 paper baseline
    metric: "[[mt_pass_at_1]]"
    value: 7.5
    unit: percent
    baseline: true
    value_text: "7.5%"
    evidence_ref: "[[ev_reflexion_evaluation]]"
  - benchmark_use: "[[bu_reflexion_webshop]]"
    system: ReAct plus Reflexion
    metric: "[[mt_success_rate]]"
    unit: text
    baseline: false
    value_text: "no significant improvement over ReAct"
    evidence_ref: "[[ev_reflexion_evaluation]]"
```

## 비교 경고

각 행의 comparability 판정은 해당 Reflexion `BenchmarkUse`를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.
