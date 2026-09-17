---
id: bu_memorybank_probe
type: benchmark_use
schema_version: 0.2.0
title: MemoryBank uses MemoryBank Long-Term Companion Probing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memorybank_evaluation]]'
tags:
  - benchmark-use
  - memorybank
paper_version: '[[pv_memorybank]]'
benchmark: '[[bm_memorybank_probe]]'
use_role: primary_evaluation
purpose: >-
  장기 companion의 관련 memory retrieval, answer correctness, coherence, base-model
  차이 평가
dataset_version: paper-created bilingual 10-day memory storage
splits:
  - 97 English probes
  - 97 Chinese probes
protocols:
  - '[[pt_memorybank]]'
metrics:
  - '[[mt_memory_retrieval_accuracy]]'
  - '[[mt_response_correctness]]'
  - '[[mt_contextual_coherence]]'
  - '[[mt_model_ranking]]'
baseline_set:
  - '[[bl_memorybank_chatglm]]'
result_sets:
  - '[[rs_memorybank]]'
comparability_status: unknown
comparability_notes: >-
  paper-specific simulated dataset과 human scoring rubric이므로 동일 protocol의 다른 use가
  현재 vault에 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: f301f3f00ef2fa6894a1fad6d60fa4b1bcd34d33df2745ca6328c0e6b559eb56
---

# MemoryBank uses MemoryBank Long-Term Companion Probing

## Purpose

장기 companion의 관련 memory retrieval, answer correctness, coherence, base-model 차이 평가

## Protocol details

- Dataset/version: paper-created bilingual 10-day memory storage
- Splits/subsets: 97 English probes; 97 Chinese probes
- Protocol: [[pt_memorybank]]
- Metrics: [[mt_memory_retrieval_accuracy]], [[mt_response_correctness]], [[mt_contextual_coherence]], [[mt_model_ranking]]

## Results

ChatGPT variant는 영어 correctness 0.716, coherence 0.912, ranking 0.818; 중국어 correctness 0.655, coherence 0.675, ranking 0.758을 보고한다.

## Comparability review

- Status: `unknown`
- paper-specific simulated dataset과 human scoring rubric이므로 동일 protocol의 다른 use가 현재 vault에 없다.

## Evidence

[[ev_memorybank_evaluation]]
