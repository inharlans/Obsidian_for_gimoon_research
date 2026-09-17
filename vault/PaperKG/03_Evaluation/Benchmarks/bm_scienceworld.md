---
id: bm_scienceworld
type: benchmark
schema_version: 0.2.0
title: ScienceWorld Agent Evaluation
aliases:
  - ScienceWorld 에이전트 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: ScienceWorld Agent Evaluation
alt_labels:
  - ScienceWorld 에이전트 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_embodied_text_action]]'
dataset: '[[ds_scienceworld]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_progress_rate]]'
preferred_label_en: ScienceWorld Agent Evaluation
preferred_label_ko: ScienceWorld 에이전트 평가
---

# ScienceWorld Agent Evaluation

## 정의

[[ta_embodied_text_action]]와 [[ds_scienceworld]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
