---
id: ca_alfworld_adamem_reflexion
type: comparison_assessment
schema_version: 0.2.0
title: ALFWorld — AdaMEM vs Reflexion comparability
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
  - '[[ev_reflexion_evaluation]]'
tags:
  - comparison-assessment
  - alfworld
benchmark: '[[bm_alfworld]]'
left_use: '[[bu_adamem_alfworld]]'
right_use: '[[bu_reflexion_alfworld]]'
comparability_status: partial
differing_fields:
  - model
  - trial_budget
  - evaluator
  - memory_update
assessment_summary: >-
  환경은 겹치지만 AdaMEM의 동적 메모리와 Reflexion의 재시도 성찰 루프가 서로 다른 trial 예산과 evaluator를
  사용한다.
assertion_origin: curator_interpreted
---

# ALFWorld — AdaMEM 대 Reflexion
