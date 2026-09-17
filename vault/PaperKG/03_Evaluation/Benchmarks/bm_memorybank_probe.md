---
id: bm_memorybank_probe
type: benchmark
schema_version: 0.2.0
title: MemoryBank Long-Term Companion Probing
aliases:
  - MemoryBank 장기 동반자 탐침
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: MemoryBank Long-Term Companion Probing
alt_labels:
  - MemoryBank 장기 동반자 탐침
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_companion_memory]]'
dataset: '[[ds_memorybank_probe]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_memory_retrieval_accuracy]]'
  - '[[mt_response_correctness]]'
  - '[[mt_contextual_coherence]]'
  - '[[mt_model_ranking]]'
preferred_label_en: MemoryBank Long-Term Companion Probing
preferred_label_ko: MemoryBank 장기 동반자 탐침
---

# MemoryBank Long-Term Companion Probing

## 정의

[[ta_companion_memory]]와 [[ds_memorybank_probe]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
