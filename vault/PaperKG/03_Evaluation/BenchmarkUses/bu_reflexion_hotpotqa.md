---
id: bu_reflexion_hotpotqa
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses HotpotQA Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_hotpotqa]]'
use_role: primary_evaluation
purpose: search+reasoning 및 ground-truth context reasoning에서 reflection의 반복 개선 효과 평가
dataset_version: HotpotQA paper-selected subset
splits:
  - 100 questions
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_exact_match]]'
  - '[[mt_success_rate]]'
baseline_set:
  - '[[bl_react]]'
  - '[[bl_episodic_replay]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: partial
comparability_notes: 'AdaMEM·G-Memory와 question count, search interface, CoT/ReAct, evaluator가 다르다.'
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: eb4e1274b79b2199959dcb96084098e1ddd89ea519b09235c4574ba93f19b6a2
---

# Reflexion uses HotpotQA Agent Evaluation

## Purpose

search+reasoning 및 ground-truth context reasoning에서 reflection의 반복 개선 효과 평가

## Protocol details

- Dataset/version: HotpotQA paper-selected subset
- Splits/subsets: 100 questions
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_exact_match]], [[mt_success_rate]]

## Results

CoT(GT)+Reflexion은 baseline 대비 14% 개선하고 episodic replay 대비 self-reflection이 8% absolute boost를 제공한다.

## Comparability review

- Status: `partial`
- AdaMEM·G-Memory와 question count, search interface, CoT/ReAct, evaluator가 다르다.

## Evidence

[[ev_reflexion_evaluation]]
