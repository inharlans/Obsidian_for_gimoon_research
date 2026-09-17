---
id: pt_memgpt
type: protocol
schema_version: 0.2.0
title: MemGPT Virtual-Context Protocol
aliases:
  - MemGPT Virtual-Context 평가 프로토콜
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: MemGPT Virtual-Context Protocol
alt_labels:
  - MemGPT Virtual-Context 평가 프로토콜
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_memgpt]]'
model_set:
  - GPT-3.5
  - GPT-4
  - GPT-4 Turbo
evaluator: task metric or paper-reported LLM judge
prompt_setting: same base model with MemGPT or fixed-context control
preprocessing: 'MSC, NaturalQuestions, and synthetic nested-key task construction'
trial_count: unknown
aggregation: task-specific accuracy or similarity
preferred_label_en: MemGPT Virtual-Context Protocol
preferred_label_ko: MemGPT Virtual-Context 평가 프로토콜
---

# MemGPT Virtual-Context Protocol

## 정의

고정-context baseline과 동일 base LLM을 비교한다. 대화 평가는 MSC 파생 DMR/opener, 문서 평가는 동일 retriever를 사용한 NaturalQuestions-Open 50문항과 합성 nested KV를 사용하며 일부 task는 LLM judge로 판정한다.
