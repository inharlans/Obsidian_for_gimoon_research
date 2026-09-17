---
id: bu_genagents_smallville
type: benchmark_use
schema_version: 0.2.0
title: Generative Agents uses Smallville Two-Day End-to-End Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_evaluation]]'
tags:
  - benchmark-use
  - genagents
paper_version: '[[pv_genagents]]'
benchmark: '[[bm_genagents_smallville]]'
use_role: auxiliary_analysis
purpose: 'open-ended multi-agent simulation에서 정보 확산, 관계 형성, event coordination과 오류 경계 관찰'
dataset_version: 25-agent Smallville two-day run
splits:
  - two full game days
  - 25 agents
protocols:
  - '[[pt_genagents]]'
metrics:
  - '[[mt_social_outcomes]]'
baseline_set:
  - '[[bl_no_memory]]'
  - '[[bl_memory_architecture_ablation]]'
  - '[[bl_human_authored]]'
result_sets:
  - '[[rs_genagents]]'
comparability_status: unknown
comparability_notes: 단일 paper-specific simulation이라 수치의 외부 직접 비교가 아니라 기술적 관찰로 해석한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 2f0350c3816d2d0ea51357d47af6d608432157d19c4b08bae0ff099897011267
---

# Generative Agents uses Smallville Two-Day End-to-End Evaluation

## Purpose

open-ended multi-agent simulation에서 정보 확산, 관계 형성, event coordination과 오류 경계 관찰

## Protocol details

- Dataset/version: 25-agent Smallville two-day run
- Splits/subsets: two full game days; 25 agents
- Protocol: [[pt_genagents]]
- Metrics: [[mt_social_outcomes]]

## Results

출마 정보 4%→32%, party 정보 4%→52%, 관계 density 0.167→0.74, 초대자 12명 중 5명 참석.

## Comparability review

- Status: `unknown`
- 단일 paper-specific simulation이라 수치의 외부 직접 비교가 아니라 기술적 관찰로 해석한다.

## Evidence

[[ev_genagents_evaluation]]
