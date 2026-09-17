---
id: bu_gmemory_pddl
type: benchmark_use
schema_version: 0.2.0
title: G-Memory uses AgentBoard PDDL Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - benchmark-use
  - gmemory
paper_version: '[[pv_gmemory]]'
benchmark: '[[bm_pddl]]'
use_role: primary_evaluation
purpose: 전략 game에서 block/action 제약과 협업 trajectory memory 평가
dataset_version: AgentBoard PDDL paper setting
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
comparability_notes: 현재 vault에 동일 PDDL protocol의 다른 use가 없어 비교 가능성을 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 51c2885303f887f22d718e4fbf5dfb09f7c419c113c251f20cc068cb32fc132c
---

# G-Memory uses AgentBoard PDDL Evaluation

## Purpose

전략 game에서 block/action 제약과 협업 trajectory memory 평가

## Protocol details

- Dataset/version: AgentBoard PDDL paper setting
- Splits/subsets: paper evaluation tasks
- Protocol: [[pt_gmemory]]
- Metrics: [[mt_progress_rate]]

## Results

full insight+interaction hierarchy가 두 ablation보다 높고 여러 MAS에서 no-memory를 상회한다.

## Comparability review

- Status: `unknown`
- 현재 vault에 동일 PDDL protocol의 다른 use가 없어 비교 가능성을 보류한다.

## Evidence

[[ev_gmemory_evaluation]]
