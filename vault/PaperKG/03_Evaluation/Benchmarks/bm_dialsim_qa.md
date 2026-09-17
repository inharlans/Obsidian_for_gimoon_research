---
id: bm_dialsim_qa
type: benchmark
schema_version: 0.2.0
title: DialSim Long-Term Dialogue QA
aliases:
  - DialSim 장기 대화 질의응답
curation_status: reviewed
evidence_refs: []
tags: []
preferred_label: DialSim Long-Term Dialogue QA
alt_labels:
  - DialSim 장기 대화 질의응답
broader: []
narrower: []
related: []
deprecated: false
task: '[[ta_long_conversation_qa]]'
dataset: '[[ds_dialsim]]'
dataset_version: paper-specified release; exact commit not stated
default_metrics:
  - '[[mt_f1]]'
  - '[[mt_bleu1]]'
preferred_label_en: DialSim Long-Term Dialogue QA
preferred_label_ko: DialSim 장기 대화 질의응답
---

# DialSim Long-Term Dialogue QA

## 정의

[[ta_long_conversation_qa]]와 [[ds_dialsim]]를 결합한 평가 단위.

## 비교 주의

동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 `BenchmarkUse` 수준에서 비교 가능성을 판정한다.
