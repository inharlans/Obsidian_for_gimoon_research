---
id: bu_alma_alfworld
type: benchmark_use
schema_version: 0.2.0
title: ALMA uses ALFWorld Text Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_evaluation]]'
tags:
  - benchmark-use
  - alma
paper_version: '[[pv_alma]]'
benchmark: '[[bm_alfworld]]'
use_role: primary_evaluation
purpose: >-
  학습된 memory design의 embodied-task continual learning, data scaling, seen→unseen
  adaptation 평가
dataset_version: standard ALFWorld config
splits:
  - train learning subset
  - 'valid seen: 140'
  - 'valid unseen: 134'
protocols:
  - '[[pt_alma]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_memory_cost]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_manual_memory]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_alma]]'
comparability_status: partial
comparability_notes: >-
  AdaMEM·G-Memory·Reflexion과 model, memory collection/deployment phase, step
  cap, split 역할이 달라 exact 비교가 아니다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: ce2f1f0958769eea8dcb4a80db697f648a0920ed7d15a6ff01f49123c582ed45
---

# ALMA uses ALFWorld Text Agent Evaluation

## Purpose

학습된 memory design의 embodied-task continual learning, data scaling, seen→unseen adaptation 평가

## Protocol details

- Dataset/version: standard ALFWorld config
- Splits/subsets: train learning subset; valid seen: 140; valid unseen: 134
- Protocol: [[pt_alma]]
- Metrics: [[mt_success_rate]], [[mt_memory_cost]], [[mt_token_usage]]

## Results

GPT-5-mini static test 87.1±1.4; dynamic valid-seen→valid-unseen adaptation 84.1%.

## Comparability review

- Status: `partial`
- AdaMEM·G-Memory·Reflexion과 model, memory collection/deployment phase, step cap, split 역할이 달라 exact 비교가 아니다.

## Evidence

[[ev_alma_evaluation]]
