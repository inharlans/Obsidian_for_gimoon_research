---
id: bm_minihack
type: benchmark
schema_version: 0.2.0
title: MiniHack Evaluation
aliases:
  - MiniHack 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: MiniHack Evaluation
alt_labels:
  - MiniHack 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_game_decision]]'
dataset: '[[ds_minihack]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_success_rate]]'
preferred_label_en: MiniHack Evaluation
preferred_label_ko: MiniHack 평가
---

# MiniHack Evaluation

## 정의

[[ta_game_decision]]와 [[ds_minihack]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
