---
id: bu_reflexion_humaneval_py
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses HumanEval Python
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_humaneval_py]]'
use_role: primary_evaluation
purpose: self-generated tests와 verbal debugging을 통한 Python code pass@1 평가
dataset_version: HumanEval Python
splits:
  - full benchmark
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_pass_at_1]]'
baseline_set:
  - '[[bl_gpt4]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: partial
comparability_notes: >-
  pass@1 정의는 paper protocol과 test generation 조건을 함께 봐야 하며 일반 leaderboard score와
  evaluator access가 다를 수 있다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: ade9c9642333507ddec2560661efa80f2655b128fa897da26b26c5e83987aa63
---

# Reflexion uses HumanEval Python

## Purpose

self-generated tests와 verbal debugging을 통한 Python code pass@1 평가

## Protocol details

- Dataset/version: HumanEval Python
- Splits/subsets: full benchmark
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_pass_at_1]]

## Results

Reflexion 91.0% pass@1, paper가 인용한 GPT-4 baseline 80.1%.

## Comparability review

- Status: `partial`
- pass@1 정의는 paper protocol과 test generation 조건을 함께 봐야 하며 일반 leaderboard score와 evaluator access가 다를 수 있다.

## Evidence

[[ev_reflexion_evaluation]]
