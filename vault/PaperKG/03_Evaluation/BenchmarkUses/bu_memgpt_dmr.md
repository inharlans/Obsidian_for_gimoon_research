---
id: bu_memgpt_dmr
type: benchmark_use
schema_version: 0.2.0
title: MemGPT uses MSC Deep Memory Retrieval
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
tags:
  - benchmark-use
  - memgpt
paper_version: '[[pv_memgpt]]'
benchmark: '[[bm_memgpt_dmr]]'
use_role: primary_evaluation
purpose: 다섯 과거 session의 narrow fact를 recall해 장기대화 consistency 평가
dataset_version: MSC extended with generated session-6 QA
splits:
  - sessions 1–5 history
  - session 6 probing QA
protocols:
  - '[[pt_memgpt]]'
metrics:
  - '[[mt_accuracy]]'
  - '[[mt_rougel]]'
baseline_set:
  - '[[bl_base_llm]]'
result_sets:
  - '[[rs_memgpt]]'
comparability_status: unknown
comparability_notes: >-
  paper-created DMR protocol이라 동일 judge와 generated QA를 사용하는 다른 use가 현재 vault에
  없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: f616e43fc6f68016eb89614f5a45ef1d12c7fc9eb5d394f74b933af428fa98d8
---

# MemGPT uses MSC Deep Memory Retrieval

## Purpose

다섯 과거 session의 narrow fact를 recall해 장기대화 consistency 평가

## Protocol details

- Dataset/version: MSC extended with generated session-6 QA
- Splits/subsets: sessions 1–5 history; session 6 probing QA
- Protocol: [[pt_memgpt]]
- Metrics: [[mt_accuracy]], [[mt_rougel]]

## Results

GPT-3.5+MemGPT 66.9%, GPT-4+MemGPT 92.5%, GPT-4 Turbo+MemGPT 93.4% accuracy; 각각 base baseline보다 높다.

## Comparability review

- Status: `unknown`
- paper-created DMR protocol이라 동일 judge와 generated QA를 사용하는 다른 use가 현재 vault에 없다.

## Evidence

[[ev_memgpt_evaluation]]
