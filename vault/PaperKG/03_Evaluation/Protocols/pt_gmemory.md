---
id: pt_gmemory
type: protocol
schema_version: 0.2.0
title: G-Memory Multi-Framework Protocol
aliases:
  - G-Memory Multi-Framework 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: G-Memory Multi-Framework Protocol
alt_labels:
  - G-Memory Multi-Framework 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_gmemory]]'
model_set:
  - GPT-4o-mini
  - paper-reported Qwen backbones
evaluator: 'task-specific success, progress, or exact-match scorer'
prompt_setting: 'AutoGen, DyLAN, and MacNet framework prompts'
preprocessing: framework/backbone factorial evaluation
trial_count: 3
aggregation: mean across three runs
preferred_label_en: G-Memory Multi-Framework Protocol
preferred_label_ko: G-Memory Multi-Framework 평가 프로토콜
---

# G-Memory Multi-Framework Protocol

## 정의

AutoGen, DyLAN, MacNet과 GPT-4o-mini/Qwen backbones 조합에서 다섯 benchmark를 평가한다. 각 결과는 세 run 평균이며 dataset별 success, progress, exact-match metric을 사용한다.
