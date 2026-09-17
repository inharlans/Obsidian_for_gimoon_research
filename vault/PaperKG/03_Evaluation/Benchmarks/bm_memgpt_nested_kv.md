---
id: bm_memgpt_nested_kv
type: benchmark
schema_version: 0.2.0
title: Nested Key-Value Retrieval
aliases:
  - 중첩 키-값 검색
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: Nested Key-Value Retrieval
alt_labels:
  - 중첩 키-값 검색
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_nested_retrieval]]'
dataset: '[[ds_nested_kv]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_accuracy]]'
preferred_label_en: Nested Key-Value Retrieval
preferred_label_ko: 중첩 키-값 검색
---

# Nested Key-Value Retrieval

## 정의

[[ta_nested_retrieval]]와 [[ds_nested_kv]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
