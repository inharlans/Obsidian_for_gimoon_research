---
id: bm_pddl
type: benchmark
schema_version: 0.2.0
title: AgentBoard PDDL Evaluation
aliases:
  - AgentBoard PDDL 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: AgentBoard PDDL Evaluation
alt_labels:
  - AgentBoard PDDL 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_game_decision]]'
dataset: '[[ds_pddl_agentboard]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_progress_rate]]'
preferred_label_en: AgentBoard PDDL Evaluation
preferred_label_ko: AgentBoard PDDL 평가
---

# AgentBoard PDDL Evaluation

## 정의

[[ta_game_decision]]와 [[ds_pddl_agentboard]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
