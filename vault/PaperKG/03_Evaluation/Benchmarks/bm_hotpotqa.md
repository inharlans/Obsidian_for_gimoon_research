---
id: bm_hotpotqa
type: benchmark
schema_version: 0.2.0
title: HotpotQA Agent Evaluation
aliases:
  - HotpotQA 에이전트 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: HotpotQA Agent Evaluation
alt_labels:
  - HotpotQA 에이전트 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_multihop_qa]]'
dataset: '[[ds_hotpotqa]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_exact_match]]'
  - '[[mt_success_rate]]'
preferred_label_en: HotpotQA Agent Evaluation
preferred_label_ko: HotpotQA 에이전트 평가
---

# HotpotQA Agent Evaluation

## 정의

[[ta_multihop_qa]]와 [[ds_hotpotqa]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
