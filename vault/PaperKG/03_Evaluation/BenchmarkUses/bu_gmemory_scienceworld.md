---
id: bu_gmemory_scienceworld
type: benchmark_use
schema_version: 0.2.0
title: G-Memory uses ScienceWorld Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - benchmark-use
  - gmemory
paper_version: '[[pv_gmemory]]'
benchmark: '[[bm_scienceworld]]'
use_role: primary_evaluation
purpose: 과학 실험 embodied task에서 cross-trial collaborative experience 활용 평가
dataset_version: ScienceWorld paper setting
splits:
  - paper evaluation tasks
protocols:
  - '[[pt_gmemory]]'
metrics:
  - '[[mt_progress_rate]]'
baseline_set:
  - '[[bl_no_memory]]'
  - '[[bl_memory_architecture_ablation]]'
result_sets:
  - '[[rs_gmemory]]'
comparability_status: unknown
comparability_notes: 동일 MAS memory protocol의 다른 ScienceWorld use가 현재 vault에 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 316e52791b6c64aea498f56d8e3980501977090db9f7adbd493e451679e3a5d3
---

# G-Memory uses ScienceWorld Agent Evaluation

## Purpose

과학 실험 embodied task에서 cross-trial collaborative experience 활용 평가

## Protocol details

- Dataset/version: ScienceWorld paper setting
- Splits/subsets: paper evaluation tasks
- Protocol: [[pt_gmemory]]
- Metrics: [[mt_progress_rate]]

## Results

GPT-4o-mini에서 G-Memory가 AutoGen 67.40, DyLAN 65.64, MacNet 68.11을 보고한다.

## Comparability review

- Status: `unknown`
- 동일 MAS memory protocol의 다른 ScienceWorld use가 현재 vault에 없다.

## Evidence

[[ev_gmemory_evaluation]]
