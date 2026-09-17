---
id: bu_evomas_workbench
type: benchmark_use
schema_version: 0.2.0
title: EvoMAS uses WorkBench Tool-Use Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_evaluation]]'
tags:
  - benchmark-use
  - evomas
paper_version: '[[pv_evomas]]'
benchmark: '[[bm_workbench]]'
use_role: primary_evaluation
purpose: 도메인별 workplace tool assignment와 다단계 실행 architecture 평가
dataset_version: WorkBench paper setting
splits:
  - paper task set; sequential queries
protocols:
  - '[[pt_evomas]]'
metrics:
  - '[[mt_accuracy]]'
  - '[[mt_execution_rate]]'
baseline_set:
  - '[[bl_evoagent]]'
  - '[[bl_fixed_budget_loop]]'
result_sets:
  - '[[rs_evomas]]'
comparability_status: unknown
comparability_notes: 현재 vault에 동일 tool interface와 sequential pool update를 사용한 다른 사례가 없어 비교를 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 78b06a5f10aa0bd37467154816ae59339b37e2d2badee794161b6d2d39f26ef6
---

# EvoMAS uses WorkBench Tool-Use Evaluation

## Purpose

도메인별 workplace tool assignment와 다단계 실행 architecture 평가

## Protocol details

- Dataset/version: WorkBench paper setting
- Splits/subsets: paper task set; sequential queries
- Protocol: [[pt_evomas]]
- Metrics: [[mt_accuracy]], [[mt_execution_rate]]

## Results

EvoAgent보다 +7.1 point; calendar domain은 높고 project-management domain은 낮아 tool orchestration 난이도 차이를 보인다.

## Comparability review

- Status: `unknown`
- 현재 vault에 동일 tool interface와 sequential pool update를 사용한 다른 사례가 없어 비교를 보류한다.

## Evidence

[[ev_evomas_evaluation]]
