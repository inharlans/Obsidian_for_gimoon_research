---
id: bu_reflexion_leetcode
type: benchmark_use
schema_version: 0.2.0
title: Reflexion uses LeetcodeHardGym
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
tags:
  - benchmark-use
  - reflexion
paper_version: '[[pv_reflexion]]'
benchmark: '[[bm_leetcodehard]]'
use_role: primary_evaluation
purpose: pretraining cutoff 이후 hard programming 문제에서 trial-based code correction 평가
dataset_version: LeetcodeHardGym 40 questions
splits:
  - 40 hard-rated questions
protocols:
  - '[[pt_reflexion]]'
metrics:
  - '[[mt_pass_at_1]]'
baseline_set:
  - '[[bl_gpt4]]'
result_sets:
  - '[[rs_reflexion]]'
comparability_status: unknown
comparability_notes: paper-created benchmark로 동일 release의 다른 use가 현재 vault에 없다.
assertion_origin: author_stated
evidence_status: table_derived
configuration_completeness: partial
configuration_fingerprint: e9ea9561a4a242f6d7f3db3b7aaf3c284af849f6d3c6d8fe564c47ed7de3634f
---

# Reflexion uses LeetcodeHardGym

## Purpose

pretraining cutoff 이후 hard programming 문제에서 trial-based code correction 평가

## Protocol details

- Dataset/version: LeetcodeHardGym 40 questions
- Splits/subsets: 40 hard-rated questions
- Protocol: [[pt_reflexion]]
- Metrics: [[mt_pass_at_1]]

## Results

Reflexion 15.0%, GPT-4 baseline 7.5%.

## Comparability review

- Status: `unknown`
- paper-created benchmark로 동일 release의 다른 use가 현재 vault에 없다.

## Evidence

[[ev_reflexion_evaluation]]
