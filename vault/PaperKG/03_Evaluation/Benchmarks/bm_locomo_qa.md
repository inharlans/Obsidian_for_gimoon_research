---
id: bm_locomo_qa
type: benchmark
schema_version: 0.2.0
title: LoCoMo Long-Term QA
aliases:
  - LoCoMo 장기 기억 질의응답
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: LoCoMo Long-Term QA
alt_labels:
  - LoCoMo 장기 기억 질의응답
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_long_conversation_qa]]'
dataset: '[[ds_locomo]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_f1]]'
  - '[[mt_bleu1]]'
preferred_label_en: LoCoMo Long-Term QA
preferred_label_ko: LoCoMo 장기 기억 질의응답
---

# LoCoMo Long-Term QA

## 정의

[[ta_long_conversation_qa]]와 [[ds_locomo]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
