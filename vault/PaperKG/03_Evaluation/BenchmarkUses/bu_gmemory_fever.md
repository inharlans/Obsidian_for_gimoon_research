---
id: bu_gmemory_fever
type: benchmark_use
schema_version: 0.2.0
title: G-Memory uses FEVER Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - benchmark-use
  - gmemory
paper_version: '[[pv_gmemory]]'
benchmark: '[[bm_fever]]'
use_role: primary_evaluation
purpose: >-
  web evidence 기반 fact verification에서 agent-specific insight와 interaction
  retrieval 평가
dataset_version: FEVER paper setting
splits:
  - paper evaluation tasks
protocols:
  - '[[pt_gmemory]]'
metrics:
  - '[[mt_exact_match]]'
baseline_set:
  - '[[bl_no_memory]]'
  - '[[bl_memory_architecture_ablation]]'
result_sets:
  - '[[rs_gmemory]]'
comparability_status: unknown
comparability_notes: 현재 vault에 동일 FEVER MAS memory use가 없어 protocol identity를 판정하지 않는다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 7d20840b133bbf87940d6392adec4cf49cc6041afb5ab7d45256de0f1954f35d
---

# G-Memory uses FEVER Agent Evaluation

## Purpose

web evidence 기반 fact verification에서 agent-specific insight와 interaction retrieval 평가

## Protocol details

- Dataset/version: FEVER paper setting
- Splits/subsets: paper evaluation tasks
- Protocol: [[pt_gmemory]]
- Metrics: [[mt_exact_match]]

## Results

GPT-4o-mini에서 세 MAS 모두 no-memory보다 높은 exact-match 결과를 보고한다.

## Comparability review

- Status: `unknown`
- 현재 vault에 동일 FEVER MAS memory use가 없어 protocol identity를 판정하지 않는다.

## Evidence

[[ev_gmemory_evaluation]]
