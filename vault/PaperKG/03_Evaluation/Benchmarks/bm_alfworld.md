---
id: bm_alfworld
type: benchmark
schema_version: 0.2.0
title: ALFWorld Text Agent Evaluation
aliases:
  - ALFWorld 텍스트 에이전트 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: ALFWorld Text Agent Evaluation
alt_labels:
  - ALFWorld 텍스트 에이전트 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_embodied_text_action]]'
dataset: '[[ds_alfworld]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_success_rate]]'
preferred_label_en: ALFWorld Text Agent Evaluation
preferred_label_ko: ALFWorld 텍스트 에이전트 평가
---

# ALFWorld Text Agent Evaluation

## 정의

[[ta_embodied_text_action]]와 [[ds_alfworld]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
