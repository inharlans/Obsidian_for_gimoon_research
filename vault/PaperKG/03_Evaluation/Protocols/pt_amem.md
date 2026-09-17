---
id: pt_amem
type: protocol
schema_version: 0.2.0
title: A-MEM Evaluation Protocol
aliases:
  - A-MEM Evaluation 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: A-MEM Evaluation Protocol
alt_labels:
  - A-MEM Evaluation 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_amem]]'
model_set:
  - six paper-reported foundation models
evaluator: benchmark metrics and paper-reported judge
prompt_setting: same system prompt across comparison systems
preprocessing: top-k 10 with all-MiniLM-L6-v2 retrieval
trial_count: unknown
aggregation: model- and category-wise scores
preferred_label_en: A-MEM Evaluation Protocol
preferred_label_ko: A-MEM Evaluation 평가 프로토콜
---

# A-MEM Evaluation Protocol

## 정의

LoCoMo와 DialSim에서 동일 system prompt를 비교군에 적용하고, LoCoMo는 6개 foundation model, QA category별 F1·BLEU-1 및 추가 지표를 보고한다. 주 retrieval 설정은 top-k 10과 all-MiniLM-L6-v2 embedding이다.
