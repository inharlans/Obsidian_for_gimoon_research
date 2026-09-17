---
id: pt_reflexion
type: protocol
schema_version: 0.2.0
title: Reflexion Verbal-RL Protocol
aliases:
  - Reflexion Verbal-RL 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: Reflexion Verbal-RL Protocol
alt_labels:
  - Reflexion Verbal-RL 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_reflexion]]'
model_set:
  - paper-reported actor models
  - GPT-4 baseline
evaluator: 'task-specific heuristic, exact-match, compiler, or generated tests'
prompt_setting: Actor-Evaluator-Self-Reflection retries
preprocessing: task-specific subsets and 1-3 reflection memory
trial_count: unknown
aggregation: task success or pass@1
preferred_label_en: Reflexion Verbal-RL Protocol
preferred_label_ko: Reflexion Verbal-RL 평가 프로토콜
---

# Reflexion Verbal-RL Protocol

## 정의

Actor–Evaluator–Self-Reflection loop를 task별 재시도에 적용하며 memory를 최근 1–3개 reflection으로 제한한다. ALFWorld 134환경, HotpotQA 100문항, code benchmarks와 WebShop 분석을 서로 다른 evaluator로 평가한다.
