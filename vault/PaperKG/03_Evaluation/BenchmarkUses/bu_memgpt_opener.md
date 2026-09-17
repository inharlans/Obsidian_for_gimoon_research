---
id: bu_memgpt_opener
type: benchmark_use
schema_version: 0.2.0
title: MemGPT uses MSC Conversation Opener
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
tags:
  - benchmark-use
  - memgpt
paper_version: '[[pv_memgpt]]'
benchmark: '[[bm_memgpt_opener]]'
use_role: primary_evaluation
purpose: 과거 persona 정보를 자발적으로 활용하는 다음-session opener engagement 평가
dataset_version: MSC conversation opener task
splits:
  - past sessions as memory
  - next-session opener
protocols:
  - '[[pt_memgpt]]'
metrics:
  - '[[mt_csim]]'
baseline_set:
  - '[[bl_human_authored]]'
  - '[[bl_base_llm]]'
result_sets:
  - '[[rs_memgpt]]'
comparability_status: unknown
comparability_notes: paper-specific similarity protocol이라 외부 direct comparison을 보류한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 905d3406c47af9041e4bfb6be204d4ac7ef7dcf7eda25d7a17becbbe7fa82faa
---

# MemGPT uses MSC Conversation Opener

## Purpose

과거 persona 정보를 자발적으로 활용하는 다음-session opener engagement 평가

## Protocol details

- Dataset/version: MSC conversation opener task
- Splits/subsets: past sessions as memory; next-session opener
- Protocol: [[pt_memgpt]]
- Metrics: [[mt_csim]]

## Results

여러 base model의 MemGPT opener가 persona similarity에서 human-written opener와 비슷하거나 일부 기준에서 높다.

## Comparability review

- Status: `unknown`
- paper-specific similarity protocol이라 외부 direct comparison을 보류한다.

## Evidence

[[ev_memgpt_evaluation]]
