---
id: bu_reflexion_mbpp_rs
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses MBPP Rust (MultiPL-E)
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_mbpp_rs]]'
use_role: primary_evaluation
purpose: Rust translation에서 language-agnostic verbal debugging 성능 평가
dataset_version: MBPP translated with MultiPL-E
splits:
  - paper translated set
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_pass_at_1]]'
baseline_set:
  - '[[bl_gpt4]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: unknown
comparability_notes: paper-specific translation/compiler protocol이라 외부 direct comparison을 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: d6a78c44d2b58a2697372a73838056ca2405ffa0c51af84326ed7507da571b20
---

# Reflexion uses MBPP Rust (MultiPL-E)

## Purpose

Rust translation에서 language-agnostic verbal debugging 성능 평가

## Protocol details

- Dataset/version: MBPP translated with MultiPL-E
- Splits/subsets: paper translated set
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_pass_at_1]]

## Results

Reflexion 75.4%, GPT-4 baseline 70.9%.

## Comparability review

- Status: `unknown`
- paper-specific translation/compiler protocol이라 외부 direct comparison을 보류한다.

## Evidence

[[ev_reflexion_evaluation]]
