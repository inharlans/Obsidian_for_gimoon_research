---
id: bm_workbench
type: benchmark
schema_version: 0.2.0
title: WorkBench Tool-Use Evaluation
aliases:
  - WorkBench 도구 사용 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: WorkBench Tool-Use Evaluation
alt_labels:
  - WorkBench 도구 사용 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_workplace_tool_use]]'
dataset: '[[ds_workbench]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_accuracy]]'
  - '[[mt_execution_rate]]'
preferred_label_en: WorkBench Tool-Use Evaluation
preferred_label_ko: WorkBench 도구 사용 평가
---

# WorkBench Tool-Use Evaluation

## 정의

[[ta_workplace_tool_use]]와 [[ds_workbench]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
