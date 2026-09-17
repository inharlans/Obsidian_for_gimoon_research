---
id: bu_amem_dialsim
type: benchmark_use
schema_version: 0.2.0
title: A-MEM uses DialSim Long-Term Dialogue QA
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_evaluation]]'
tags:
  - benchmark-use
  - amem
paper_version: '[[pv_amem]]'
benchmark: '[[bm_dialsim_qa]]'
use_role: primary_evaluation
purpose: 장기 multi-party dialogue에서 기억 기반 QA와 응답 유사도 평가
dataset_version: DialSim release used by the paper
splits:
  - paper evaluation split
protocols:
  - '[[pt_amem]]'
metrics:
  - '[[mt_f1]]'
  - '[[mt_bleu1]]'
  - '[[mt_rougel]]'
baseline_set:
  - '[[bl_memgpt]]'
  - '[[bl_memorybank]]'
result_sets:
  - '[[rs_amem]]'
comparability_status: unknown
comparability_notes: 현재 vault에 동일 DialSim protocol의 다른 사용 사례가 없어 protocol identity 비교를 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 905fcf0e10b455d08ff66e6f205a7b16e5d452b82183fa44bfc82e78bc393eb2
---

# A-MEM uses DialSim Long-Term Dialogue QA

## Purpose

장기 multi-party dialogue에서 기억 기반 QA와 응답 유사도 평가

## Protocol details

- Dataset/version: DialSim release used by the paper
- Splits/subsets: paper evaluation split
- Protocol: [[pt_amem]]
- Metrics: [[mt_f1]], [[mt_bleu1]], [[mt_rougel]]

## Results

A-MEM F1 3.45, BLEU-1 3.37, ROUGE-L 3.54; LoCoMo와 MemGPT baseline보다 높게 보고되었다.

## Comparability review

- Status: `unknown`
- 현재 vault에 동일 DialSim protocol의 다른 사용 사례가 없어 protocol identity 비교를 보류한다.

## Evidence

[[ev_amem_evaluation]]
