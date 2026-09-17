---
id: pt_evomas
type: protocol
schema_version: 0.2.0
title: EvoMAS Sequential Evolution Protocol
aliases:
  - EvoMAS Sequential Evolution 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: EvoMAS Sequential Evolution Protocol
alt_labels:
  - EvoMAS Sequential Evolution 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_evomas]]'
model_set:
  - paper-reported Claude and Qwen backbones
evaluator: judge reward with execution cost
prompt_setting: sequential configuration evolution
preprocessing: queries processed in paper order
trial_count: 3
aggregation: mean with token and latency cost
preferred_label_en: EvoMAS Sequential Evolution Protocol
preferred_label_ko: EvoMAS Sequential Evolution 평가 프로토콜
---

# EvoMAS Sequential Evolution Protocol

## 정의

query를 순차 처리하며 현재 configuration pool과 experience memory로 진화시킨 뒤 최적 구성을 pool에 추가한다. task별 세 번 실행 평균을 보고하고 judge reward에 실행 token·latency cost를 결합한다.
