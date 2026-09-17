---
id: bm_humaneval_rs
type: benchmark
schema_version: 0.2.0
title: HumanEval Rust (MultiPL-E)
aliases:
  - HumanEval 러스트(MultiPL-E)
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: HumanEval Rust (MultiPL-E)
alt_labels:
  - HumanEval 러스트(MultiPL-E)
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_code_generation]]'
dataset: '[[ds_humaneval]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_pass_at_1]]'
preferred_label_en: HumanEval Rust (MultiPL-E)
preferred_label_ko: HumanEval 러스트(MultiPL-E)
---

# HumanEval Rust (MultiPL-E)

## 정의

[[ta_code_generation]]와 [[ds_humaneval]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
