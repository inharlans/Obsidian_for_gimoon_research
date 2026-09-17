---
id: pt_adamem
type: protocol
schema_version: 0.2.0
title: AdaMEM Evaluation Protocol
aliases:
  - AdaMEM Evaluation 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: AdaMEM Evaluation Protocol
alt_labels:
  - AdaMEM Evaluation 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_adamem]]'
model_set:
  - paper-reported language-agent backbones
evaluator: task environment and paper-reported scorers
prompt_setting: paper-specific text-agent prompt
preprocessing: shared successful-trajectory pool
trial_count: 3
aggregation: mean and standard deviation
preferred_label_en: AdaMEM Evaluation Protocol
preferred_label_ko: AdaMEM Evaluation 평가 프로토콜
---

# AdaMEM Evaluation Protocol

## 정의

ALFWorld seen 140/unseen 134, WebShop, HotpotQA 500문항 cross-episode 설정을 text-only로 평가한다. 세 독립 run의 평균·표준편차를 사용하며 long-term memory는 동일한 성공 궤적 pool에서 구성한다.
