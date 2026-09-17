---
id: bu_adamem_alfworld
type: benchmark_use
schema_version: 0.2.0
title: AdaMEM uses ALFWorld Text Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
tags:
  - benchmark-use
  - adamem
paper_version: '[[pv_adamem]]'
benchmark: '[[bm_alfworld]]'
use_role: primary_evaluation
purpose: 동적 state 변화와 novel room layout에서 embodied task 적응 평가
dataset_version: standard ALFWorld text-only setting
splits:
  - 'seen: 140'
  - 'unseen: 134'
protocols:
  - '[[pt_adamem]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_reasoningbank]]'
  - '[[bl_synapse]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_adamem]]'
comparability_status: partial
comparability_notes: >-
  다른 ALFWorld 논문과 backbone, 성공 trajectory pool, step policy, split 운용이 다르므로
  exact 비교가 아니다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 44478757c46e6af965eceba64e221bc6801da54c798ebc00a3727c2c4b579d13
---

# AdaMEM uses ALFWorld Text Agent Evaluation

## Purpose

동적 state 변화와 novel room layout에서 embodied task 적응 평가

## Protocol details

- Dataset/version: standard ALFWorld text-only setting
- Splits/subsets: seen: 140; unseen: 134
- Protocol: [[pt_adamem]]
- Metrics: [[mt_success_rate]], [[mt_token_usage]]

## Results

training-free on-policy AdaMEM-LOW: seen 54.0±2.9, unseen 58.2±3.9. STEP-MFT 계열은 추가 향상을 보고한다.

## Comparability review

- Status: `partial`
- 다른 ALFWorld 논문과 backbone, 성공 trajectory pool, step policy, split 운용이 다르므로 exact 비교가 아니다.

## Evidence

[[ev_adamem_evaluation]]
