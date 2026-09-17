---
id: bm_humaneval_py
type: benchmark
schema_version: 0.2.0
title: HumanEval Python
aliases:
  - HumanEval 파이썬
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: HumanEval Python
alt_labels:
  - HumanEval 파이썬
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_code_generation]]'
dataset: '[[ds_humaneval]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_pass_at_1]]'
preferred_label_en: HumanEval Python
preferred_label_ko: HumanEval 파이썬
---

# HumanEval Python

## 정의

[[ta_code_generation]]와 [[ds_humaneval]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
