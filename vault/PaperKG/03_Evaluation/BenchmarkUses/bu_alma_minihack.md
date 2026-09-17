---
id: bu_alma_minihack
type: benchmark_use
schema_version: 0.2.0
title: ALMA uses MiniHack Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_evaluation]]'
tags:
  - benchmark-use
  - alma
paper_version: '[[pv_alma]]'
benchmark: '[[bm_minihack]]'
use_role: primary_evaluation
purpose: >-
  procedural dungeon에서 spatial memory, risk management, long-horizon plan의 자동 설계
  평가
dataset_version: BALROG MiniHack
splits:
  - 30% learning
  - 70% testing; split collection/deployment
protocols:
  - '[[pt_alma]]'
metrics:
  - '[[mt_success_rate]]'
  - '[[mt_memory_cost]]'
baseline_set:
  - '[[bl_manual_memory]]'
  - '[[bl_no_memory]]'
result_sets:
  - '[[rs_alma]]'
comparability_status: unknown
comparability_notes: 동일 task subset과 learned-memory protocol의 다른 use가 현재 vault에 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 88dac2eed1a18becbea2cfb8e6e5246e154ce958f2a95f30765dfac5168e5845
---

# ALMA uses MiniHack Evaluation

## Purpose

procedural dungeon에서 spatial memory, risk management, long-horizon plan의 자동 설계 평가

## Protocol details

- Dataset/version: BALROG MiniHack
- Splits/subsets: 30% learning; 70% testing; split collection/deployment
- Protocol: [[pt_alma]]
- Metrics: [[mt_success_rate]], [[mt_memory_cost]]

## Results

GPT-5-mini transfer에서 ALMA 20.0±2.9로 비교군 중 최고이며 reflex rules와 risk memory가 발견된다.

## Comparability review

- Status: `unknown`
- 동일 task subset과 learned-memory protocol의 다른 use가 현재 vault에 없다.

## Evidence

[[ev_alma_evaluation]]
