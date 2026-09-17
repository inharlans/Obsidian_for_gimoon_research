---
id: bu_reflexion_mbpp_py
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses MBPP Python
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_mbpp_py]]'
use_role: primary_evaluation
purpose: Python programming에서 generated-test 오류가 reflection 성능에 미치는 영향 평가
dataset_version: MBPP Python
splits:
  - paper benchmark set
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
  self-generated test false-positive rate가 결과를 좌우하므로 다른 pass@1과 protocol
  identity 확인이 필요하다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 9bdf21d9597585c27d3e7784b486f2382d9bb2882ce7e975c73ba1232e1eae74
---

# Reflexion uses MBPP Python

## Purpose

Python programming에서 generated-test 오류가 reflection 성능에 미치는 영향 평가

## Protocol details

- Dataset/version: MBPP Python
- Splits/subsets: paper benchmark set
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_pass_at_1]]

## Results

Reflexion 77.1%로 paper의 GPT-4 baseline 80.1%보다 낮고, test false-positive 16.3%가 주요 원인으로 분석된다.

## Comparability review

- Status: `partial`
- self-generated test false-positive rate가 결과를 좌우하므로 다른 pass@1과 protocol identity 확인이 필요하다.

## Evidence

[[ev_reflexion_evaluation]]
