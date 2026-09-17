---
id: bu_alma_baba
type: benchmark_use
schema_version: 0.2.0
title: ALMA uses Baba Is AI Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_evaluation]]'
tags:
  - benchmark-use
  - alma
paper_version: '[[pv_alma]]'
benchmark: '[[bm_baba_is_ai]]'
use_role: primary_evaluation
purpose: 변하는 game rule을 위한 strategy library와 plan synthesis memory의 자동 발견 평가
dataset_version: BALROG Baba Is AI
splits:
  - half learning/testing
  - each half split collection/deployment
protocols:
  - '[[pt_alma]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_memory_cost]]'
baseline_set:
  - '[[bl_manual_memory]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_alma]]'
comparability_status: unknown
comparability_notes: paper-specific memory-design search와 split이므로 외부 직접 비교를 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: ac323e0d837ba5eae4a47681618439c3f570f28443876d06ba98aa649f7b1ab2
---

# ALMA uses Baba Is AI Evaluation

## Purpose

변하는 game rule을 위한 strategy library와 plan synthesis memory의 자동 발견 평가

## Protocol details

- Dataset/version: BALROG Baba Is AI
- Splits/subsets: half learning/testing; each half split collection/deployment
- Protocol: [[pt_alma]]
- Metrics: [[mt_success_rate]], [[mt_memory_cost]]

## Results

GPT-5-mini transfer에서 ALMA 33.3±2.4; learned design은 rule-aware strategy switching 등을 포함한다.

## Comparability review

- Status: `unknown`
- paper-specific memory-design search와 split이므로 외부 직접 비교를 보류한다.

## Evidence

[[ev_alma_evaluation]]
