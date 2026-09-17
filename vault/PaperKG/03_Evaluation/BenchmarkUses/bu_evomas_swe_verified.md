---
id: bu_evomas_swe_verified
type: benchmark_use
schema_version: 0.2.0
title: EvoMAS uses SWE-Bench-Verified
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_evaluation]]'
tags:
  - benchmark-use
  - evomas
paper_version: '[[pv_evomas]]'
benchmark: '[[bm_swe_verified]]'
use_role: primary_evaluation
purpose: 500개 verified software issue에서 budget-matched MAS generation 평가
dataset_version: SWE-Bench-Verified
splits:
  - 500 issues
protocols:
  - '[[pt_evomas]]'
metrics:
  - '[[mt_resolved_rate]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_evoagent]]'
  - '[[bl_fixed_budget_loop]]'
result_sets:
  - '[[rs_evomas]]'
comparability_status: partial
comparability_notes: >-
  leaderboard의 다른 systems와 agent scaffold·model·budget이 다를 수 있어 paper 내부
  matched-budget 비교를 우선한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 828bbd4b9fa168771e8987bef4e2ccc41969b9e05422b39810fd6cbea353a2a0
---

# EvoMAS uses SWE-Bench-Verified

## Purpose

500개 verified software issue에서 budget-matched MAS generation 평가

## Protocol details

- Dataset/version: SWE-Bench-Verified
- Splits/subsets: 500 issues
- Protocol: [[pt_evomas]]
- Metrics: [[mt_resolved_rate]], [[mt_token_usage]]

## Results

Claude-4.5-Sonnet 조건에서 79.1%; 동일 31M-token loop 71.4%보다 높다.

## Comparability review

- Status: `partial`
- leaderboard의 다른 systems와 agent scaffold·model·budget이 다를 수 있어 paper 내부 matched-budget 비교를 우선한다.

## Evidence

[[ev_evomas_evaluation]]
