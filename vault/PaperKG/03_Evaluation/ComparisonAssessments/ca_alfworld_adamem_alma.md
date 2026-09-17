---
id: ca_alfworld_adamem_alma
type: comparison_assessment
schema_version: 0.2.0
title: ALFWorld — AdaMEM vs ALMA comparability
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
  - '[[ev_alma_evaluation]]'
tags:
  - comparison-assessment
  - alfworld
benchmark: '[[bm_alfworld]]'
left_use: '[[bu_adamem_alfworld]]'
right_use: '[[bu_alma_alfworld]]'
comparability_status: partial
differing_fields:
  - model
  - memory_collection_phase
  - split_role
  - update_policy
assessment_summary: 동일한 seen·unseen 규모를 일부 공유하지만 학습·배치 단계와 메모리 갱신 방식이 달라 수치를 직접 순위화하지 않는다.
assertion_origin: curator_interpreted
---

# ALFWorld — AdaMEM 대 ALMA

프로토콜 차이를 통제한 재현 실험 없이는 직접 순위화하지 않는다.
