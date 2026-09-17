---
id: bu_alma_textworld
type: benchmark_use
schema_version: 0.2.0
title: ALMA uses BALROG TextWorld Evaluation
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_evaluation]]'
tags:
  - benchmark-use
  - alma
paper_version: '[[pv_alma]]'
benchmark: '[[bm_textworld]]'
use_role: primary_evaluation
purpose: >-
  부분 관찰 text adventure에서 domain-specific memory design의 exploration·object
  strategy 재사용 평가
dataset_version: BALROG TextWorld Treasure Hunter and Cooking
splits:
  - 52 tasks; half learning/testing
  - each half split collection/deployment
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
comparability_notes: 현재 vault에 동일 BALROG split과 meta-learned memory protocol의 다른 use가 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: 22ed14cf0507d97f8cea7331c960a022cddb89981ae511c7388a387470f6f263
---

# ALMA uses BALROG TextWorld Evaluation

## Purpose

부분 관찰 text adventure에서 domain-specific memory design의 exploration·object strategy 재사용 평가

## Protocol details

- Dataset/version: BALROG TextWorld Treasure Hunter and Cooking
- Splits/subsets: 52 tasks; half learning/testing; each half split collection/deployment
- Protocol: [[pt_alma]]
- Metrics: [[mt_success_rate]], [[mt_memory_cost]]

## Results

GPT-5-mini transfer에서 ALMA 75.0±2.3으로 manual baselines와 no-memory를 상회한다.

## Comparability review

- Status: `unknown`
- 현재 vault에 동일 BALROG split과 meta-learned memory protocol의 다른 use가 없다.

## Evidence

[[ev_alma_evaluation]]
