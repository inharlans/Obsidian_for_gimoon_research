---
id: me_genagents
type: method
schema_version: 0.2.0
title: Generative Agents Memory–Reflection–Planning Architecture
aliases:
  - Generative Agents 메모리·성찰·계획 구조
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_method]]'
tags:
  - paper-method
  - genagents
preferred_label: Generative Agents Memory–Reflection–Planning Architecture
alt_labels:
  - Generative Agents 메모리·성찰·계획 구조
broader: []
narrower: []
related:
  - '[[rt_social_simulation]]'
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_genagents]]'
domain_profile: agentic-memory
profile:
  memory_unit: natural-language observation
  write_policy: append observations and synthesized reflections
  organization_structure: memory stream with reflection and planning
  update_strategy: importance-triggered reflection
  retrieval_strategy: 'recency, importance, and relevance'
  temporal_handling: timestamped observations and plans
  online_or_offline: online simulation
preferred_label_en: Generative Agents Memory–Reflection–Planning Architecture
preferred_label_ko: Generative Agents 메모리·성찰·계획 구조
---

# Generative Agents Memory–Reflection–Planning Architecture

## 정의

모든 관찰을 timestamp와 함께 memory stream에 저장한다. 현재 상황에 대해 recency, importance, relevance를 결합해 기억을 검색하고, 누적 importance가 threshold를 넘으면 상위 reflection을 생성한다. daily plan을 하위 action으로 분해하고 환경 변화에 반응해 다시 계획한다.

## 구성요소

- complete natural-language memory stream
- recency–importance–relevance retrieval
- recursive higher-level reflection
- hierarchical daily planning and reaction
- Smallville multi-agent sandbox

## 구현·평가 문맥

이 method node는 [[pv_genagents]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_genagents_method]] 및 [[rs_genagents]]를 따른다.
