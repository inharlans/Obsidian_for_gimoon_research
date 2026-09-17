---
id: bu_evomas_bbeh
type: benchmark_use
schema_version: 0.2.0
title: EvoMAS uses BBEH Multi-Agent Reasoning
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_evaluation]]'
tags:
  - benchmark-use
  - evomas
paper_version: '[[pv_evomas]]'
benchmark: '[[bm_bbeh]]'
use_role: primary_evaluation
purpose: multi-step reasoning과 tool-augmented problem solving에서 generated MAS 성능·실행률 평가
dataset_version: BBEH/BBEH-Mini paper setting
splits:
  - paper sequential query order
protocols:
  - '[[pt_evomas]]'
metrics:
  - '[[mt_accuracy]]'
  - '[[mt_execution_rate]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_evoagent]]'
  - '[[bl_fixed_budget_loop]]'
result_sets:
  - '[[rs_evomas]]'
comparability_status: unknown
comparability_notes: 현재 vault에서 동일 sequential evolution protocol의 다른 BBEH 사용이 없어 exact 판정을 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: e6e109ad2ef457288b998fcb6e02b254965e280af7cd7fc1a5e756e1b5ceb349
---

# EvoMAS uses BBEH Multi-Agent Reasoning

## Purpose

multi-step reasoning과 tool-augmented problem solving에서 generated MAS 성능·실행률 평가

## Protocol details

- Dataset/version: BBEH/BBEH-Mini paper setting
- Splits/subsets: paper sequential query order
- Protocol: [[pt_evomas]]
- Metrics: [[mt_accuracy]], [[mt_execution_rate]], [[mt_token_usage]]

## Results

EvoAgent 대비 +10.5 point; backbone별 BBEH-Mini에서 prior automatic generators를 상회한다.

## Comparability review

- Status: `unknown`
- 현재 vault에서 동일 sequential evolution protocol의 다른 BBEH 사용이 없어 exact 판정을 보류한다.

## Evidence

[[ev_evomas_evaluation]]
