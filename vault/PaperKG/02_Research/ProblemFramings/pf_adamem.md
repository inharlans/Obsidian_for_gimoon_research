---
id: pf_adamem
type: problem_framing
schema_version: 0.2.0
title: AdaMEM problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_problem]]'
tags:
  - problem-framing
  - adamem
paper_version: '[[pv_adamem]]'
problem: '[[pr_rigid_memory]]'
framing_summary: >-
  기존 trajectory·strategy memory는 episode initiation에 retrieval을 front-load하므로 중간
  실패와 sub-goal 변화에 대응하기 어렵다. 과도한 online parameter update 없이 intra-episode
  adaptation이 필요하다.
claimed_cause: >-
  episode 시작 때 한 번만 기억을 검색하는 정적 방식은 긴 task가 진행되면서 guidance가 낡는다. AdaMEM은
  parameter update 없이 필요한 step에서 성공 궤적을 검색하고 state-specific strategy를 합성한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# AdaMEM problem framing

## Paper-specific framing

기존 trajectory·strategy memory는 episode initiation에 retrieval을 front-load하므로 중간 실패와 sub-goal 변화에 대응하기 어렵다. 과도한 online parameter update 없이 intra-episode adaptation이 필요하다.

## Canonical problem

[[pr_rigid_memory]]

## Evidence

[[ev_adamem_problem]]
