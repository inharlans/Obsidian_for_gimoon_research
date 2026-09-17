---
id: bu_reflexion_humaneval_rs
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses HumanEval Rust (MultiPL-E)
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_humaneval_rs]]'
use_role: primary_evaluation
purpose: compiled Rust 환경에서 self-reflection과 test generation 협력 평가
dataset_version: 50 hardest HumanEval translated with MultiPL-E
splits:
  - 50 hardest problems
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_pass_at_1]]'
baseline_set:
  - '[[bl_gpt4]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: unknown
comparability_notes: paper-specific translated subset과 compiler feedback protocol이다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 8aa1e9430a379688f85830592e709538ebd6e63e28f463a0c8b16e38b6b01538
---

# Reflexion uses HumanEval Rust (MultiPL-E)

## Purpose

compiled Rust 환경에서 self-reflection과 test generation 협력 평가

## Protocol details

- Dataset/version: 50 hardest HumanEval translated with MultiPL-E
- Splits/subsets: 50 hardest problems
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_pass_at_1]]

## Results

Reflexion 68.0%, GPT-4 baseline 60.0%; ablation에서 test 또는 reflection 제거 시 full variant보다 낮다.

## Comparability review

- Status: `unknown`
- paper-specific translated subset과 compiler feedback protocol이다.

## Evidence

[[ev_reflexion_evaluation]]
