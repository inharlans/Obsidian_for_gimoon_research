---
id: me_evomas
type: method
schema_version: 0.2.0
title: EvoMAS Configuration-Space Evolution
aliases:
  - EvoMAS 구성 공간 진화
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_method]]'
tags:
  - paper-method
  - evomas
preferred_label: EvoMAS Configuration-Space Evolution
alt_labels:
  - EvoMAS 구성 공간 진화
broader: []
narrower: []
related:
  - '[[rt_automated_agent_design]]'
deprecated: false
introduced_by: '[[pv_evomas]]'
domain_profile: agentic-memory
profile:
  memory_unit: MAS configuration plus experience
  write_policy: retain selected evolved configurations
  organization_structure: configuration pool and experience memory
  update_strategy: sequential evolutionary generation
  retrieval_strategy: reuse pool experience for later queries
  online_or_offline: online sequential evolution
  complexity: judge reward balanced with tokens and latency
  agent_scope: shared_multi_agent_memory
  memory_target_category:
    - design_space
    - experience_trajectory
  design_origin: meta_learned
preferred_label_en: EvoMAS Configuration-Space Evolution
preferred_label_ko: EvoMAS 구성 공간 진화
---

# EvoMAS Configuration-Space Evolution

## 정의

agent role·prompt·model·tool·acyclic communication graph를 declarative configuration으로 표현한다. LLM meta-model이 task 관련 parent를 선택하고, execution feedback으로 한 component type을 mutate하거나 부모 topology를 보존한 crossover를 수행한다. 최고 구성과 trace summary를 pool·memory에 누적한다.

## 구성요소

- structured MAS configuration and runtime interpreter
- task-conditioned selection
- single-component mutation
- topology-preserving crossover
- pool and experience-memory consolidation

## 구현·평가 문맥

이 method node는 [[pv_evomas]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_evomas_method]] 및 [[rs_evomas]]를 따른다.
