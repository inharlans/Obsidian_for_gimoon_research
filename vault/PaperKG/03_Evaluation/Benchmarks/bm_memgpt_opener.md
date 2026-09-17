---
id: bm_memgpt_opener
type: benchmark
schema_version: 0.2.0
title: MSC Conversation Opener
aliases:
  - MSC 대화 시작문
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: MSC Conversation Opener
alt_labels:
  - MSC 대화 시작문
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_long_conversation_qa]]'
dataset: '[[ds_msc_opener]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_csim]]'
preferred_label_en: MSC Conversation Opener
preferred_label_ko: MSC 대화 시작문
---

# MSC Conversation Opener

## 정의

[[ta_long_conversation_qa]]와 [[ds_msc_opener]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
