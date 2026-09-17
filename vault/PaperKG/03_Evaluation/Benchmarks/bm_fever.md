---
id: bm_fever
type: benchmark
schema_version: 0.2.0
title: FEVER Agent Evaluation
aliases:
  - FEVER 에이전트 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: FEVER Agent Evaluation
alt_labels:
  - FEVER 에이전트 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_fact_verification]]'
dataset: '[[ds_fever]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_exact_match]]'
preferred_label_en: FEVER Agent Evaluation
preferred_label_ko: FEVER 에이전트 평가
---

# FEVER Agent Evaluation

## 정의

[[ta_fact_verification]]와 [[ds_fever]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
