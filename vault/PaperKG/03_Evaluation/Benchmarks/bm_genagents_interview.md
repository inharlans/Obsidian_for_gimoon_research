---
id: bm_genagents_interview
type: benchmark
schema_version: 0.2.0
title: Generative Agents Controlled Interview
aliases:
  - Generative Agents 통제 인터뷰
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: Generative Agents Controlled Interview
alt_labels:
  - Generative Agents 통제 인터뷰
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_agent_believability]]'
dataset: '[[ds_smallville_interviews]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_believability_rank]]'
preferred_label_en: Generative Agents Controlled Interview
preferred_label_ko: Generative Agents 통제 인터뷰
---

# Generative Agents Controlled Interview

## 정의

[[ta_agent_believability]]와 [[ds_smallville_interviews]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
