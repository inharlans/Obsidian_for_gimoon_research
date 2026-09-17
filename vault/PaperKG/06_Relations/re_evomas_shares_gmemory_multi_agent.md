---
id: re_evomas_shares_gmemory_multi_agent
type: relation
schema_version: 0.2.0
title: EvoMAS and G-Memory both hold shared multi-agent memory
aliases: []
curation_status: candidate
evidence_refs: []
tags:
  - typed-relation
  - facet-candidate
subject: '[[me_evomas]]'
predicate: shares_design_facet
object: '[[me_gmemory]]'
shared_facet: agent_scope=shared_multi_agent_memory
assertion_origin: curator_interpreted
confidence: medium
---

# EvoMAS and G-Memory both hold shared multi-agent memory

## 관계

- Subject: [[me_evomas]]
- Predicate: `shares_design_facet`
- Object: [[me_gmemory]]
- Shared facet: `agent_scope=shared_multi_agent_memory`

## 근거

이미 검수된 [[me_evomas]]와 [[me_gmemory]]의 `profile` 필드 비교에서 나온 curator 해석이다. 둘 다 개별 에이전트 하나의 사적 기억이 아니라 멀티에이전트 팀 전체에 걸친 구조(EvoMAS의 configuration pool·experience memory, G-Memory의 3계층 그래프)를 관리한다는 점이 겹친다. 저장 대상(EvoMAS=system configuration, G-Memory=interaction/insight)은 다르다는 점도 함께 기록한다.

## 검수 메모

이 vault에서 `agent_scope`가 `shared_multi_agent_memory`인 Method는 현재 이 둘뿐이다(나머지 7편은 single_agent_memory). 두 논문이 직접 비교·인용한 근거는 없으므로 `compares_against`가 아니라 `shares_design_facet`을 쓴다. 사람 승인 전까지 candidate 유지.
