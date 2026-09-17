---
id: bu_memgpt_docqa
type: benchmark_use
schema_version: 0.2.0
title: MemGPT uses NaturalQuestions Multi-Document QA
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
tags:
  - benchmark-use
  - memgpt
paper_version: '[[pv_memgpt]]'
benchmark: '[[bm_memgpt_docqa]]'
use_role: primary_evaluation
purpose: context window를 넘는 Wikipedia document pool에서 반복 검색으로 질문 답변
dataset_version: late-2018 Wikipedia; NaturalQuestions-Open subset
splits:
  - 50 sampled questions
  - top-K retrieved documents varied
protocols:
  - '[[pt_memgpt]]'
metrics:
  - '[[mt_accuracy]]'
baseline_set:
  - '[[bl_fixed_context]]'
result_sets:
  - '[[rs_memgpt]]'
comparability_status: partial
comparability_notes: >-
  fixed baseline과 동일 retriever지만 MemGPT는 반복 pagination을 허용하므로 입력 budget과
  retrieval count를 함께 봐야 한다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: eb20e4f80ae708acaa807cc851382b4b074a12d7c8c5e225504d5b956cd9cb2b
---

# MemGPT uses NaturalQuestions Multi-Document QA

## Purpose

context window를 넘는 Wikipedia document pool에서 반복 검색으로 질문 답변

## Protocol details

- Dataset/version: late-2018 Wikipedia; NaturalQuestions-Open subset
- Splits/subsets: 50 sampled questions; top-K retrieved documents varied
- Protocol: [[pt_memgpt]]
- Metrics: [[mt_accuracy]]

## Results

고정-context baseline은 truncation이 커질수록 저하되지만 GPT-4 기반 MemGPT는 document count 증가에 더 안정적이다.

## Comparability review

- Status: `partial`
- fixed baseline과 동일 retriever지만 MemGPT는 반복 pagination을 허용하므로 입력 budget과 retrieval count를 함께 봐야 한다.

## Evidence

[[ev_memgpt_evaluation]]
