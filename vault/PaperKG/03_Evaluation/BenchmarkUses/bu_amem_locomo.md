---
id: bu_amem_locomo
type: benchmark_use
schema_version: 0.2.0
title: A-MEM uses LoCoMo Long-Term QA
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_evaluation]]'
tags:
  - benchmark-use
  - amem
paper_version: '[[pv_amem]]'
benchmark: '[[bm_locomo_qa]]'
use_role: primary_evaluation
purpose: '장기대화 기억의 single-hop, multi-hop, temporal, open-domain, adversarial QA 성능 평가'
dataset_version: LoCoMo release used by the paper
splits:
  - 'all 7,512 QA pairs; category-wise'
protocols:
  - '[[pt_amem]]'
metrics:
  - '[[mt_f1]]'
  - '[[mt_bleu1]]'
baseline_set:
  - '[[bl_memgpt]]'
  - '[[bl_memorybank]]'
result_sets:
  - '[[rs_amem]]'
comparability_status: partial
comparability_notes: >-
  같은 LoCoMo 이름이라도 foundation model, prompt, retrieval k, evaluator 구현이 다른 연구와
  동일하지 않아 직접 수치 비교는 partial이다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: b8f78a1cffbe0880d1b5364ad8c4e2332b537a61368c714c75ff218b10067b2d
---

# A-MEM uses LoCoMo Long-Term QA

## Purpose

장기대화 기억의 single-hop, multi-hop, temporal, open-domain, adversarial QA 성능 평가

## Protocol details

- Dataset/version: LoCoMo release used by the paper
- Splits/subsets: all 7,512 QA pairs; category-wise
- Protocol: [[pt_amem]]
- Metrics: [[mt_f1]], [[mt_bleu1]]

## Results

A-MEM은 non-GPT model 전반과 multi-hop/temporal category에서 강한 향상을 보고하며 table에는 model·category별 점수가 분리되어 있다.

## Comparability review

- Status: `partial`
- 같은 LoCoMo 이름이라도 foundation model, prompt, retrieval k, evaluator 구현이 다른 연구와 동일하지 않아 직접 수치 비교는 partial이다.

## Evidence

[[ev_amem_evaluation]]
