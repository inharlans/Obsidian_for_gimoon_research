---
id: me_amem
type: method
schema_version: 0.2.0
title: A-MEM Structured Linking and Memory Evolution
aliases:
  - A-MEM 구조화 연결 및 메모리 진화
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_method]]'
tags:
  - paper-method
  - amem
preferred_label: A-MEM Structured Linking and Memory Evolution
alt_labels:
  - A-MEM 구조화 연결 및 메모리 진화
broader: []
narrower: []
related:
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_amem]]'
domain_profile: agentic-memory
profile:
  memory_unit: structured memory note
  write_policy: 'generate context, keywords, tags, and links'
  organization_structure: linked note graph
  linking_strategy: LLM-generated historical links
  update_strategy: memory evolution updates related notes
  retrieval_strategy: semantic retrieval over linked notes
  online_or_offline: online inference-time
  agent_scope: single_agent_memory
  memory_target_category:
    - semantic_knowledge_note
  design_origin: hand_crafted
preferred_label_en: A-MEM Structured Linking and Memory Evolution
preferred_label_ko: A-MEM 구조화 연결 및 메모리 진화
---

# A-MEM Structured Linking and Memory Evolution

## 정의

각 상호작용을 content, timestamp, keyword, tag, context, embedding, link를 가진 atomic note로 만들고, embedding top-k 후보를 LLM이 연결한 뒤 관련 과거 note의 context·keyword·tag를 새 경험에 맞춰 진화시킨다.

## 구성요소

- LLM 기반 structured note construction
- embedding 후보 검색 후 LLM link generation
- 새 기억을 이용한 historical memory evolution
- query embedding과 연결 기억을 이용한 retrieval

## 구현·평가 문맥

이 method node는 [[pv_amem]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_amem_method]] 및 [[rs_amem]]를 따른다.
