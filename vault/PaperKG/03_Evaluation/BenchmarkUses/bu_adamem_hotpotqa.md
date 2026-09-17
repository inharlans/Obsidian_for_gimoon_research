---
id: bu_adamem_hotpotqa
type: benchmark_use
schema_version: 0.2.0
title: AdaMEM uses HotpotQA Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
tags:
  - benchmark-use
  - adamem
paper_version: '[[pv_adamem]]'
benchmark: '[[bm_hotpotqa]]'
use_role: primary_evaluation
purpose: 여러 episode에 걸친 agentic search와 answer refinement 평가
dataset_version: HotpotQA paper-selected subset
splits:
  - 500 test questions
  - max 15 steps or 3 episodes
protocols:
  - '[[pt_adamem]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_exact_match]]'
baseline_set:
  - '[[bl_reasoningbank]]'
  - '[[bl_synapse]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_adamem]]'
comparability_status: partial
comparability_notes: >-
  G-Memory와 Reflexion은 HotpotQA의 MAS/CoT/ReAct protocol과 question count가 달라
  이름만으로 직접 비교할 수 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: cc97ffc9dc35aee324cc1af720e3f6875c35c30d57953b1a0a04dbe0a07a1e31
---

# AdaMEM uses HotpotQA Agent Evaluation

## Purpose

여러 episode에 걸친 agentic search와 answer refinement 평가

## Protocol details

- Dataset/version: HotpotQA paper-selected subset
- Splits/subsets: 500 test questions; max 15 steps or 3 episodes
- Protocol: [[pt_adamem]]
- Metrics: [[mt_success_rate]], [[mt_exact_match]]

## Results

AdaMEM 41.1±0.5, ReasoningBank 40.5±0.8, Synapse 40.4±0.2, no-memory 39.7±1.9.

## Comparability review

- Status: `partial`
- G-Memory와 Reflexion은 HotpotQA의 MAS/CoT/ReAct protocol과 question count가 달라 이름만으로 직접 비교할 수 없다.

## Evidence

[[ev_adamem_evaluation]]
