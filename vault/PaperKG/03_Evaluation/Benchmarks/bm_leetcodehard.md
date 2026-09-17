---
id: bm_leetcodehard
type: benchmark
schema_version: 0.2.0
title: LeetcodeHardGym
aliases:
  - LeetcodeHardGym
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: LeetcodeHardGym
alt_labels:
  - LeetcodeHardGym
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_code_generation]]'
dataset: '[[ds_leetcode_hard_gym]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_pass_at_1]]'
preferred_label_en: LeetcodeHardGym
preferred_label_ko: LeetcodeHardGym
---

# LeetcodeHardGym

## 정의

[[ta_code_generation]]와 [[ds_leetcode_hard_gym]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
