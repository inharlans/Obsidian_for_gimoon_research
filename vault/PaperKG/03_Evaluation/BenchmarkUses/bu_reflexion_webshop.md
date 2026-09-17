---
id: bu_reflexion_webshop
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses WebShop Agent Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_webshop]]'
use_role: error_analysis
purpose: 다양한 search exploration이 필요한 task에서 verbal reflection의 local-minimum failure 분석
dataset_version: WebShop appendix experiment
splits:
  - 100 customer requests
  - terminated after four trials
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_success_rate]]'
baseline_set:
  - '[[bl_react]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: partial
comparability_notes: AdaMEM은 Task Score와 다른 model/memory protocol을 사용하므로 score를 직접 비교하지 않는다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 1b0636a002f3a4014580e19d454b7d3f99a54a89ffdcd0c9d6a495f80a2e1f30
---

# Reflexion uses WebShop Agent Evaluation

## Purpose

다양한 search exploration이 필요한 task에서 verbal reflection의 local-minimum failure 분석

## Protocol details

- Dataset/version: WebShop appendix experiment
- Splits/subsets: 100 customer requests; terminated after four trials
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_success_rate]]

## Results

ReAct+Reflexion이 ReAct보다 유의하게 개선되지 않아 다양성과 exploration이 필요한 검색에서 한계를 보였다.

## Comparability review

- Status: `partial`
- AdaMEM은 Task Score와 다른 model/memory protocol을 사용하므로 score를 직접 비교하지 않는다.

## Evidence

[[ev_reflexion_evaluation]]
