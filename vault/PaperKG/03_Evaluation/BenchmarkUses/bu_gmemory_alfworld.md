---
id: bu_gmemory_alfworld
type: benchmark_use
schema_version: 0.2.0
title: G-Memory uses ALFWorld Text Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_evaluation]]'
tags:
  - benchmark-use
  - gmemory
paper_version: '[[pv_gmemory]]'
benchmark: '[[bm_alfworld]]'
use_role: primary_evaluation
purpose: MAS 협업 기억이 household embodied action success에 미치는 효과 평가
dataset_version: ALFWorld paper setting
splits:
  - paper evaluation tasks; no explicit split
protocols:
  - '[[pt_gmemory]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_no_memory]]'
  - '[[bl_memory_architecture_ablation]]'
result_sets:
  - '[[rs_gmemory]]'
comparability_status: partial
comparability_notes: >-
  AdaMEM·ALMA·Reflexion과 MAS framework, backbone, trial-memory update, task
  selection이 달라 direct score comparison은 partial이다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: ea5617b9136f4e87c5d2b02cef599ddcbc23c9de04bd71ee1fd9df2b9642ae92
---

# G-Memory uses ALFWorld Text Agent Evaluation

## Purpose

MAS 협업 기억이 household embodied action success에 미치는 효과 평가

## Protocol details

- Dataset/version: ALFWorld paper setting
- Splits/subsets: paper evaluation tasks; no explicit split
- Protocol: [[pt_gmemory]]
- Metrics: [[mt_success_rate]], [[mt_token_usage]]

## Results

AutoGen+GPT-4o-mini에서 G-Memory 88.81로 no-memory 77.61보다 높으며 framework/backbone 전반에서 개선을 보고한다.

## Comparability review

- Status: `partial`
- AdaMEM·ALMA·Reflexion과 MAS framework, backbone, trial-memory update, task selection이 달라 direct score comparison은 partial이다.

## Evidence

[[ev_gmemory_evaluation]]
