---
id: bm_swe_verified
type: benchmark
schema_version: 0.2.0
title: SWE-Bench-Verified
aliases:
  - SWE-Bench-Verified
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: SWE-Bench-Verified
alt_labels:
  - SWE-Bench-Verified
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_software_issue_resolution]]'
dataset: '[[ds_swebench]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_resolved_rate]]'
preferred_label_en: SWE-Bench-Verified
preferred_label_ko: SWE-Bench-Verified
---

# SWE-Bench-Verified

## 정의

[[ta_software_issue_resolution]]와 [[ds_swebench]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
