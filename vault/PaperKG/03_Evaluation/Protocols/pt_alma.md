---
id: pt_alma
type: protocol
schema_version: 0.2.0
title: ALMA Memory-Design Evaluation Protocol
aliases:
  - ALMA Memory-Design Evaluation 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: ALMA Memory-Design Evaluation Protocol
alt_labels:
  - ALMA Memory-Design Evaluation 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_alma]]'
model_set:
  - GPT-5-mini
  - paper-reported comparison models
evaluator: task environment success scorer
prompt_setting: memory-design collection and deployment prompts
preprocessing: learning/testing then collection/deployment split
trial_count: 3
aggregation: mean and standard error
preferred_label_en: ALMA Memory-Design Evaluation Protocol
preferred_label_ko: ALMA Memory-Design Evaluation 평가 프로토콜
---

# ALMA Memory-Design Evaluation Protocol

## 정의

dataset을 learning/testing으로 분리하고 다시 memory collection/deployment로 나눈다. deployment를 세 번 반복해 평균 success와 standard error를 보고하며 static mode와 ALFWorld dynamic distribution-shift mode를 구분한다.
