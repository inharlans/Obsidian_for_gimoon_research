---
id: me_memgpt
type: method
schema_version: 0.2.0
title: MemGPT Virtual Context Management
aliases:
  - MemGPT 가상 컨텍스트 관리
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_method]]'
tags:
  - paper-method
  - memgpt
preferred_label: MemGPT Virtual Context Management
alt_labels:
  - MemGPT 가상 컨텍스트 관리
broader: []
narrower: []
related:
  - '[[rt_long_context]]'
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_memgpt]]'
domain_profile: agentic-memory
profile:
  memory_unit: 'core, recall, and archival memory'
  write_policy: LLM-directed function calls
  organization_structure: virtual-memory tiers
  update_strategy: paging between context and external storage
  retrieval_strategy: function-mediated archival search
  temporal_handling: persistent conversation memory
  online_or_offline: online
  agent_scope: single_agent_memory
  memory_target_category:
    - context_window_paging
  design_origin: hand_crafted
preferred_label_en: MemGPT Virtual Context Management
preferred_label_ko: MemGPT 가상 컨텍스트 관리
---

# MemGPT Virtual Context Management

## 정의

context window를 main context, 외부 recall/archival storage를 secondary tier로 구성한다. user/system/timed event가 inference를 trigger하고 LLM function calls가 storage search·write와 context modification을 수행한다. chaining은 여러 retrieval을 한 turn 안에서 이어 간다.

## 구성요소

- hierarchical main, recall, and archival memory
- LLM-controlled paging via function calls
- event-triggered interrupts
- function chaining and yield control
- working-context update and external vector search

## 구현·평가 문맥

이 method node는 [[pv_memgpt]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_memgpt_method]] 및 [[rs_memgpt]]를 따른다.
