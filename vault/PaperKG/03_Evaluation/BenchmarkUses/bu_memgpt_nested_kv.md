---
id: bu_memgpt_nested_kv
type: benchmark_use
schema_version: 0.2.0
title: MemGPT uses Nested Key-Value Retrieval
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
tags:
  - benchmark-use
  - memgpt
paper_version: '[[pv_memgpt]]'
benchmark: '[[bm_memgpt_nested_kv]]'
use_role: primary_evaluation
purpose: 외부 storage에서 여러 function query를 연쇄해 multi-hop lookup 수행
dataset_version: 140 UUID pairs; paper-created
splits:
  - nesting levels 0–4
  - 30 order configurations
protocols:
  - '[[pt_memgpt]]'
metrics:
  - '[[mt_accuracy]]'
baseline_set:
  - '[[bl_fixed_context]]'
result_sets:
  - '[[rs_memgpt]]'
comparability_status: unknown
comparability_notes: paper-created synthetic task라 현재 vault에 동일 protocol의 다른 use가 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 505577018c4e64bfb2ee3417c5f4275268218148376c3e75568f1615f8a0d808
---

# MemGPT uses Nested Key-Value Retrieval

## Purpose

외부 storage에서 여러 function query를 연쇄해 multi-hop lookup 수행

## Protocol details

- Dataset/version: 140 UUID pairs; paper-created
- Splits/subsets: nesting levels 0–4; 30 order configurations
- Protocol: [[pt_memgpt]]
- Metrics: [[mt_accuracy]]

## Results

GPT-4+MemGPT는 nesting 증가에도 안정적인 반면 fixed GPT-4/4 Turbo는 3 nesting에서 0%에 도달한다.

## Comparability review

- Status: `unknown`
- paper-created synthetic task라 현재 vault에 동일 protocol의 다른 use가 없다.

## Evidence

[[ev_memgpt_evaluation]]
