---
id: me_alma
type: method
schema_version: 0.2.0
title: ALMA Open-Ended Code-Space Memory Design
aliases:
  - ALMA 개방형 코드 공간 메모리 설계
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_method]]'
tags:
  - paper-method
  - alma
preferred_label: ALMA Open-Ended Code-Space Memory Design
alt_labels:
  - ALMA 개방형 코드 공간 메모리 설계
broader: []
narrower: []
related:
  - '[[rt_agentic_memory]]'
  - '[[rt_automated_agent_design]]'
  - '[[rt_continual_agent_learning]]'
deprecated: false
introduced_by: '[[pv_alma]]'
domain_profile: agentic-memory
profile:
  memory_unit: executable memory-design code and evaluation log
  write_policy: 'generate, debug, and archive candidate designs'
  organization_structure: open-ended code-space archive
  update_strategy: meta-learned design search
  retrieval_strategy: sample prior designs and logs
  online_or_offline: offline learning then deployment
  complexity: rollout- and evaluation-intensive
  agent_scope: single_agent_memory
  memory_target_category:
    - design_space
  design_origin: meta_learned
preferred_label_en: ALMA Open-Ended Code-Space Memory Design
preferred_label_ko: ALMA 개방형 코드 공간 메모리 설계
---

# ALMA Open-Ended Code-Space Memory Design

## 정의

memory module을 general_update와 general_retrieve interface 및 선택적 submodule/database로 추상화한다. Meta Agent는 archive의 design code, success rate, stratified logs를 보고 idea·plan을 만들고 Python code로 구현한 뒤 sandbox trial/debug와 benchmark evaluation을 거쳐 archive에 추가한다.

## 구성요소

- code-based memory-design search space
- update/retrieve modular abstraction
- performance- and novelty-aware archive sampling
- Meta Agent ideation, implementation, debugging
- memory collection/deployment evaluation

## 구현·평가 문맥

이 method node는 [[pv_alma]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_alma_method]] 및 [[rs_alma]]를 따른다.
