---
id: re_adamem_shares_reflexion_strategy_policy
type: relation
schema_version: 0.2.0
title: AdaMEM and Reflexion both synthesize actionable strategy from experience
aliases: []
curation_status: candidate
evidence_refs: []
tags:
  - typed-relation
  - facet-candidate
subject: '[[me_adamem]]'
predicate: shares_design_facet
object: '[[me_reflexion]]'
shared_facet: memory_target_category=strategy_policy
assertion_origin: curator_interpreted
confidence: medium
---

# AdaMEM and Reflexion both synthesize actionable strategy from experience

## 관계

- Subject: [[me_adamem]]
- Predicate: `shares_design_facet`
- Object: [[me_reflexion]]
- Shared facet: `memory_target_category=strategy_policy`

## 근거

이미 검수된 [[me_adamem]]과 [[me_reflexion]]의 `profile` 필드 비교에서 나온 curator 해석이다. 둘 다 원본 경험(trajectory)을 그대로 저장하지 않고 다음 시도의 행동을 바꾸는 자연어 strategy/lesson으로 압축한다는 점이 겹친다. 다만 Reflexion은 최근 1~3개만 남기는 bounded buffer(온전한 online trial loop)이고 AdaMEM은 장기 저장 + STEP-MFT fine-tuning까지 결합한다는 차이도 함께 기록한다.

## 검수 메모

이 두 논문이 서로 비교·인용했다는 근거는 없다. `re_evomas_leaves_coordination_scope`처럼 하나가 다른 하나의 한계를 지적하는 것도 아니다. 순수하게 memory_target_category 축의 구조적 유사성이므로 `shares_design_facet`을 쓴다. 사람 승인 전까지 candidate 유지.
