---
id: re_alma_shares_evomas_design_space
type: relation
schema_version: 0.2.0
title: ALMA and EvoMAS both target the design space itself
aliases: []
curation_status: candidate
evidence_refs: []
tags:
  - typed-relation
  - facet-candidate
subject: '[[me_alma]]'
predicate: shares_design_facet
object: '[[me_evomas]]'
shared_facet: memory_target_category=design_space
assertion_origin: curator_interpreted
confidence: medium
---

# ALMA and EvoMAS both target the design space itself

## 관계

- Subject: [[me_alma]]
- Predicate: `shares_design_facet`
- Object: [[me_evomas]]
- Shared facet: `memory_target_category=design_space`, `design_origin=meta_learned`

## 근거

원문을 다시 읽은 것이 아니라, 이미 검수된 [[me_alma]]와 [[me_evomas]]의 `profile` 필드를 비교해서 나온 curator 해석이다. 둘 다 "메모리(또는 시스템) 설계 자체"를 탐색·진화의 대상으로 삼는다는 점에서 겹치며(ALMA는 memory design을 code-space에서, EvoMAS는 MAS configuration을 진화 탐색으로), 이 축 밖에서는 agent_scope(single vs shared multi-agent)가 다르다는 점도 함께 기록한다.

## 검수 메모

`compares_against`나 `extends_method`가 아니라 `shares_design_facet`을 쓴 이유: 두 논문이 서로를 실제로 벤치마크 비교하거나 인용해 확장했다는 근거는 없다. 오직 설계 대상 축(design_space)이 겹친다는 구조적 관찰이다. 사람이 승인하기 전까지 candidate로 유지한다.
