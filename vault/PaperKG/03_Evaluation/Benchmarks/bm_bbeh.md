---
id: bm_bbeh
type: benchmark
schema_version: 0.2.0
title: BBEH Multi-Agent Reasoning
aliases:
  - BBEH 다중 에이전트 추론
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: BBEH Multi-Agent Reasoning
alt_labels:
  - BBEH 다중 에이전트 추론
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_mas_reasoning]]'
dataset: '[[ds_bbeh]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_accuracy]]'
  - '[[mt_execution_rate]]'
preferred_label_en: BBEH Multi-Agent Reasoning
preferred_label_ko: BBEH 다중 에이전트 추론
---

# BBEH Multi-Agent Reasoning

## 정의

[[ta_mas_reasoning]]와 [[ds_bbeh]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
