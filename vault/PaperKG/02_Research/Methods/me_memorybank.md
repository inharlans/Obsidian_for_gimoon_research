---
id: me_memorybank
type: method
schema_version: 0.2.0
title: MemoryBank Storage–Retrieval–Forgetting Mechanism
aliases:
  - MemoryBank 저장·검색·망각 메커니즘
curation_status: reviewed
evidence_refs:
  - '[[ev_memorybank_method]]'
tags:
  - paper-method
  - memorybank
preferred_label: MemoryBank Storage–Retrieval–Forgetting Mechanism
alt_labels:
  - MemoryBank 저장·검색·망각 메커니즘
broader: []
narrower: []
related:
  - '[[rt_long_context]]'
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_memorybank]]'
domain_profile: agentic-memory
profile:
  memory_unit: event summary and user portrait
  write_policy: periodic summarization and profile update
  organization_structure: long-term event and portrait store
  update_strategy: new dialogue consolidation
  retrieval_strategy: relevance-based memory retrieval
  forgetting_or_pruning: Ebbinghaus-inspired decay
  online_or_offline: online companion use
preferred_label_en: MemoryBank Storage–Retrieval–Forgetting Mechanism
preferred_label_ko: MemoryBank 저장·검색·망각 메커니즘
---

# MemoryBank Storage–Retrieval–Forgetting Mechanism

## 정의

timestamped multi-turn dialogue, daily/global event summary, daily/global personality summary를 계층적으로 저장한다. dense dual-tower embedding과 FAISS로 현재 context 관련 기억을 찾고, Ebbinghaus R=exp(-t/S)를 단순화한 strength를 recall 시 증가·reset해 선택적으로 유지한다.

## 구성요소

- chronological dialogue storage
- daily and global event summaries
- dynamic user personality portrait
- dense retrieval with FAISS
- Ebbinghaus-inspired decay and reinforcement

## 구현·평가 문맥

이 method node는 [[pv_memorybank]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_memorybank_method]] 및 [[rs_memorybank]]를 따른다.
