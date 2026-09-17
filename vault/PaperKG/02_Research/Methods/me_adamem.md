---
id: me_adamem
type: method
schema_version: 0.2.0
title: AdaMEM Hybrid Trajectory–Strategy Memory
aliases:
  - AdaMEM 하이브리드 궤적·전략 메모리
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_method]]'
tags:
  - paper-method
  - adamem
preferred_label: AdaMEM Hybrid Trajectory–Strategy Memory
alt_labels:
  - AdaMEM 하이브리드 궤적·전략 메모리
broader: []
narrower: []
related:
  - '[[rt_agentic_memory]]'
  - '[[rt_continual_agent_learning]]'
deprecated: false
introduced_by: '[[pv_adamem]]'
domain_profile: agentic-memory
profile:
  memory_unit: successful trajectory plus abstract strategy
  write_policy: on-policy and off-policy test-time updates
  organization_structure: hybrid trajectory-strategy store
  update_strategy: intra-episode strategy refresh
  retrieval_strategy: state-conditioned retrieval
  online_or_offline: online test-time
  forgetting_or_pruning: success-only retention in reviewed version
preferred_label_en: AdaMEM Hybrid Trajectory–Strategy Memory
preferred_label_ko: AdaMEM 하이브리드 궤적·전략 메모리
---

# AdaMEM Hybrid Trajectory–Strategy Memory

## 정의

성공 trajectory의 각 state를 key로 장기 기억에 저장하고, 현재 state에서 관련 경험을 검색해 짧은 자연어 strategy를 합성한다. HIGH는 필요한 step마다 transient strategy를 만들고 LOW는 strategy를 유지하다 agent 판단으로 refresh한다. STEP-MFT는 성공하며 baseline action을 바꾼 strategy만 rejection-sampling fine-tuning한다.

## 구성요소

- offline successful-trajectory long-term memory
- online state-conditioned short-term strategy synthesis
- HIGH/LOW adaptation-effort modes
- STEP-MFT action-change filtering and fine-tuning

## 구현·평가 문맥

이 method node는 [[pv_adamem]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_adamem_method]] 및 [[rs_adamem]]를 따른다.
