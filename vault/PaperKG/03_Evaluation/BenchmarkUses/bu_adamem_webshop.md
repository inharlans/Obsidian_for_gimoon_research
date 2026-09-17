---
id: bu_adamem_webshop
type: benchmark_use
schema_version: 0.2.0
title: AdaMEM uses WebShop Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_evaluation]]'
tags:
  - benchmark-use
  - adamem
paper_version: '[[pv_adamem]]'
benchmark: '[[bm_webshop]]'
use_role: primary_evaluation
purpose: homepage의 정보 부족과 중간 검색 상태 변화에서 dynamic retrieval 효과 평가
dataset_version: paper text-only WebShop environment
splits:
  - paper evaluation set
protocols:
  - '[[pt_adamem]]'
metrics:
  - '[[mt_task_score]]'
  - '[[mt_token_usage]]'
baseline_set:
  - '[[bl_reasoningbank]]'
  - '[[bl_synapse]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_adamem]]'
comparability_status: partial
comparability_notes: Reflexion의 WebShop 분석과 평가 model·trial·metric 해석이 달라 직접 성능 비교는 부적절하다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 7fc3b1beceece8f26a2e75df2f08d5b8923955c86126c6f4daf771e8f85e09a2
---

# AdaMEM uses WebShop Agent Evaluation

## Purpose

homepage의 정보 부족과 중간 검색 상태 변화에서 dynamic retrieval 효과 평가

## Protocol details

- Dataset/version: paper text-only WebShop environment
- Splits/subsets: paper evaluation set
- Protocol: [[pt_adamem]]
- Metrics: [[mt_task_score]], [[mt_token_usage]]

## Results

on-policy AdaMEM-LOW Task Score 74.2±0.3; static Synapse와 ReasoningBank의 negative transfer를 역전했다고 분석한다.

## Comparability review

- Status: `partial`
- Reflexion의 WebShop 분석과 평가 model·trial·metric 해석이 달라 직접 성능 비교는 부적절하다.

## Evidence

[[ev_adamem_evaluation]]
