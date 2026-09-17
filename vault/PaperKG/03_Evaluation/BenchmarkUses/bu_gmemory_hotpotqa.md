---
id: bu_gmemory_hotpotqa
type: benchmark_use
schema_version: 0.2.0
title: G-Memory uses HotpotQA Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - benchmark-use
  - gmemory
paper_version: '[[pv_gmemory]]'
benchmark: '[[bm_hotpotqa]]'
use_role: primary_evaluation
purpose: multi-agent web search와 여러 supporting fact 합성에서 memory cue 효과 평가
dataset_version: HotpotQA paper setting
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
comparability_status: partial
comparability_notes: AdaMEM의 cross-episode 500문항 및 Reflexion의 100문항 ReAct/CoT와 protocol이 다르다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 6785db7fd77fa5b11586134ad155093971d38c76a37aab37abfd537703f0e20c
---

# G-Memory uses HotpotQA Agent Evaluation

## Purpose

multi-agent web search와 여러 supporting fact 합성에서 memory cue 효과 평가

## Protocol details

- Dataset/version: HotpotQA paper setting
- Splits/subsets: paper evaluation tasks
- Protocol: [[pt_gmemory]]
- Metrics: [[mt_exact_match]]

## Results

GPT-4o-mini에서 G-Memory는 AutoGen 35.67, DyLAN 34.69, MacNet 35.69를 보고한다.

## Comparability review

- Status: `partial`
- AdaMEM의 cross-episode 500문항 및 Reflexion의 100문항 ReAct/CoT와 protocol이 다르다.

## Evidence

[[ev_gmemory_evaluation]]
