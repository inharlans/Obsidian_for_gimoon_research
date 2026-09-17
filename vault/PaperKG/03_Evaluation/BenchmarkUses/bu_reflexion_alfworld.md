---
id: bu_reflexion_alfworld
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses ALFWorld Text Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_alfworld]]'
use_role: primary_evaluation
purpose: 실패 reflection이 embodied long-horizon task 재시도에 주는 학습 효과 평가
dataset_version: ALFWorld protocol following ReAct
splits:
  - 134 environments
  - six task types
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_success_rate]]'
baseline_set:
  - '[[bl_react]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: partial
comparability_notes: >-
  AdaMEM·G-Memory·ALMA와 agent, memory update, trial budget, model이 달라 direct
  numeric comparison은 exact가 아니다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: d315e14bb4ae95dab81f73acf73f9ddeee4b5c64444bdbab62cf50182e9a8e6a
---

# Reflexion uses ALFWorld Text Agent Evaluation

## Purpose

실패 reflection이 embodied long-horizon task 재시도에 주는 학습 효과 평가

## Protocol details

- Dataset/version: ALFWorld protocol following ReAct
- Splits/subsets: 134 environments; six task types
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_success_rate]]

## Results

ReAct+Reflexion heuristic evaluator가 130/134 task를 해결하고 baseline은 trial 6–7 사이 개선이 정체된다.

## Comparability review

- Status: `partial`
- AdaMEM·G-Memory·ALMA와 agent, memory update, trial budget, model이 달라 direct numeric comparison은 exact가 아니다.

## Evidence

[[ev_reflexion_evaluation]]
