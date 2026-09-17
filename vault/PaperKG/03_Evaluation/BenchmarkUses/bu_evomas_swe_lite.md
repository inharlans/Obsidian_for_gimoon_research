---
id: bu_evomas_swe_lite
type: benchmark_use
schema_version: 0.2.0
title: EvoMAS uses SWE-Bench-Lite
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_evaluation]]'
tags:
  - benchmark-use
  - evomas
paper_version: '[[pv_evomas]]'
benchmark: '[[bm_swe_lite]]'
use_role: primary_evaluation
purpose: 300개 실제 software issue에서 MAS configuration evolution의 patch 해결 능력 평가
dataset_version: SWE-Bench-Lite
splits:
  - 300 issues
protocols:
  - '[[pt_evomas]]'
metrics:
  - '[[mt_resolved_rate]]'
  - '[[mt_execution_rate]]'
baseline_set:
  - '[[bl_evoagent]]'
  - '[[bl_fixed_budget_loop]]'
result_sets:
  - '[[rs_evomas]]'
comparability_status: partial
comparability_notes: >-
  SWE-Bench agent scaffold, model pool, parallel worker, repository state가 성능에
  영향을 주므로 benchmark 이름만으로 exact 비교하지 않는다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 5c8f6f5fec6b6c54dac8b0ae90577570c76e9e9f4d34a0e77db29a7069c41d89
---

# EvoMAS uses SWE-Bench-Lite

## Purpose

300개 실제 software issue에서 MAS configuration evolution의 patch 해결 능력 평가

## Protocol details

- Dataset/version: SWE-Bench-Lite
- Splits/subsets: 300 issues
- Protocol: [[pt_evomas]]
- Metrics: [[mt_resolved_rate]], [[mt_execution_rate]]

## Results

Claude-3.5-Sonnet 33.9%, Qwen3-235B 48.2%, Qwen3-480B 57.6%로 표에 보고된다.

## Comparability review

- Status: `partial`
- SWE-Bench agent scaffold, model pool, parallel worker, repository state가 성능에 영향을 주므로 benchmark 이름만으로 exact 비교하지 않는다.

## Evidence

[[ev_evomas_evaluation]]
