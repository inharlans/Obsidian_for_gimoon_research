---
id: bm_memgpt_docqa
type: benchmark
schema_version: 0.2.0
title: NaturalQuestions Multi-Document QA
aliases:
  - NaturalQuestions 다중 문서 질의응답
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: NaturalQuestions Multi-Document QA
alt_labels:
  - NaturalQuestions 다중 문서 질의응답
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_document_qa]]'
dataset: '[[ds_nq_wikipedia]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_accuracy]]'
preferred_label_en: NaturalQuestions Multi-Document QA
preferred_label_ko: NaturalQuestions 다중 문서 질의응답
---

# NaturalQuestions Multi-Document QA

## 정의

[[ta_document_qa]]와 [[ds_nq_wikipedia]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
