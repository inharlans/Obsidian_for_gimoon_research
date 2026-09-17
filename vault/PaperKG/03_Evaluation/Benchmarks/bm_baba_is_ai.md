---
id: bm_baba_is_ai
type: benchmark
schema_version: 0.2.0
title: Baba Is AI Evaluation
aliases:
  - Baba Is AI 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: Baba Is AI Evaluation
alt_labels:
  - Baba Is AI 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_game_decision]]'
dataset: '[[ds_baba_is_ai]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_success_rate]]'
preferred_label_en: Baba Is AI Evaluation
preferred_label_ko: Baba Is AI 평가
---

# Baba Is AI Evaluation

## 정의

[[ta_game_decision]]와 [[ds_baba_is_ai]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
