---
id: me_gmemory
type: method
schema_version: 0.2.0
title: G-Memory Three-Tier Hierarchical Graph
aliases:
  - G-Memory 3계층 계층 그래프
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_method]]'
tags:
  - paper-method
  - gmemory
preferred_label: G-Memory Three-Tier Hierarchical Graph
alt_labels:
  - G-Memory 3계층 계층 그래프
broader: []
narrower: []
related:
  - '[[rt_multi_agent_memory]]'
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_gmemory]]'
domain_profile: agentic-memory
profile:
  memory_unit: 'query, insight, and interaction memory'
  write_policy: store outcomes across three hierarchy levels
  organization_structure: three-tier hierarchical graph
  linking_strategy: cross-level graph links
  update_strategy: post-task graph update
  retrieval_strategy: hierarchical graph retrieval
  online_or_offline: cross-task online accumulation
preferred_label_en: G-Memory Three-Tier Hierarchical Graph
preferred_label_ko: G-Memory 3계층 계층 그래프
---

# G-Memory Three-Tier Hierarchical Graph

## 정의

interaction graph는 agent utterance와 영감/전달 관계, query graph는 task·status·interaction graph와 query 관계, insight graph는 여러 query가 지지하는 일반 insight를 저장한다. 새 query는 similarity와 graph hop으로 후보를 찾고 위로 insight, 아래로 core interaction path를 검색하며 실행 뒤 모든 계층을 갱신한다.

## 구성요소

- interaction graph for utterance-level collaboration
- query graph with task status and semantic edges
- insight graph with supporting-query hyper-connections
- coarse retrieval and bi-directional traversal
- agent-specific memory projection and joint update

## 구현·평가 문맥

이 method node는 [[pv_gmemory]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_gmemory_method]] 및 [[rs_gmemory]]를 따른다.
