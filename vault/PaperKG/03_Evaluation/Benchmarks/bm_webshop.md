---
id: bm_webshop
type: benchmark
schema_version: 0.2.0
title: WebShop Agent Evaluation
aliases:
  - WebShop 에이전트 평가
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: WebShop Agent Evaluation
alt_labels:
  - WebShop 에이전트 평가
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_web_shopping]]'
dataset: '[[ds_webshop]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_task_score]]'
preferred_label_en: WebShop Agent Evaluation
preferred_label_ko: WebShop 에이전트 평가
---

# WebShop Agent Evaluation

## 정의

[[ta_web_shopping]]와 [[ds_webshop]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
