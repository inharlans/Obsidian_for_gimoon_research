---
id: ca_hotpotqa_gmemory_reflexion
type: comparison_assessment
schema_version: 0.2.0
title: HotpotQA — G-Memory vs Reflexion comparability
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
  - '[[ev_reflexion_evaluation]]'
tags:
  - comparison-assessment
  - hotpotqa
benchmark: '[[bm_hotpotqa]]'
left_use: '[[bu_gmemory_hotpotqa]]'
right_use: '[[bu_reflexion_hotpotqa]]'
comparability_status: not_comparable
differing_fields:
  - multi_agent_framework
  - question_subset
  - reasoning_protocol
  - evaluator
assessment_summary: 다중 에이전트 메모리 평가와 self-reflection 재시도 평가는 목적과 실행 단위가 달라 절대 점수를 직접 비교하지 않는다.
assertion_origin: curator_interpreted
---

# HotpotQA — G-Memory 대 Reflexion
