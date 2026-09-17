---
id: bu_genagents_controlled
type: benchmark_use
schema_version: 0.2.0
title: Generative Agents uses Generative Agents Controlled Interview
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_evaluation]]'
tags:
  - benchmark-use
  - genagents
paper_version: '[[pv_genagents]]'
benchmark: '[[bm_genagents_interview]]'
use_role: primary_evaluation
purpose: >-
  self-knowledge, memory, plan, reaction, reflection 응답의 believability와
  architecture component 기여 평가
dataset_version: paper-created controlled interview set
splits:
  - 100 participants; within-subject
  - five question categories
protocols:
  - '[[pt_genagents]]'
metrics:
  - '[[mt_believability_rank]]'
baseline_set:
  - '[[bl_no_memory]]'
  - '[[bl_memory_architecture_ablation]]'
  - '[[bl_human_authored]]'
result_sets:
  - '[[rs_genagents]]'
comparability_status: unknown
comparability_notes: paper-specific human study라 동일 protocol의 외부 benchmark use가 현재 vault에 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 5815c759eafdc8b1d0386810e9b85ce1f1b89daf53cf27e4259b5a4e28ee396e
---

# Generative Agents uses Generative Agents Controlled Interview

## Purpose

self-knowledge, memory, plan, reaction, reflection 응답의 believability와 architecture component 기여 평가

## Protocol details

- Dataset/version: paper-created controlled interview set
- Splits/subsets: 100 participants; within-subject; five question categories
- Protocol: [[pt_genagents]]
- Metrics: [[mt_believability_rank]]

## Results

full architecture는 no-memory, no-reflection/no-planning, no-reflection ablation보다 전반적으로 높은 believability ranking을 얻었다.

## Comparability review

- Status: `unknown`
- paper-specific human study라 동일 protocol의 외부 benchmark use가 현재 vault에 없다.

## Evidence

[[ev_genagents_evaluation]]
