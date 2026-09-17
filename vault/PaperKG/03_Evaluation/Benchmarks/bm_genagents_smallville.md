---
id: bm_genagents_smallville
type: benchmark
schema_version: 0.2.0
title: Smallville Two-Day End-to-End Evaluation
aliases:
  - Smallville 이틀 종단 간 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: Smallville Two-Day End-to-End Evaluation
alt_labels:
  - Smallville 이틀 종단 간 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_social_simulation]]'
dataset: '[[ds_smallville_simulation]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_social_outcomes]]'
preferred_label_en: Smallville Two-Day End-to-End Evaluation
preferred_label_ko: Smallville 이틀 종단 간 평가
---

# Smallville Two-Day End-to-End Evaluation

## 정의

[[ta_social_simulation]]와 [[ds_smallville_simulation]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
