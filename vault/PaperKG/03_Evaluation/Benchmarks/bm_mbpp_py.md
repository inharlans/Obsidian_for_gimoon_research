---
id: bm_mbpp_py
type: benchmark
schema_version: 0.2.0
title: MBPP Python
aliases:
  - MBPP 파이썬
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: MBPP Python
alt_labels:
  - MBPP 파이썬
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_code_generation]]'
dataset: '[[ds_mbpp]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_pass_at_1]]'
preferred_label_en: MBPP Python
preferred_label_ko: MBPP 파이썬
---

# MBPP Python

## 정의

[[ta_code_generation]]와 [[ds_mbpp]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
