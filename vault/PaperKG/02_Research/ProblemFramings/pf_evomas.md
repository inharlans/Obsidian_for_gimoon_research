---
id: pf_evomas
type: problem_framing
schema_version: 0.2.0
title: EvoMAS problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_problem]]'
tags:
  - problem-framing
  - evomas
paper_version: '[[pv_evomas]]'
problem: '[[pr_manual_mas_design]]'
framing_summary: >-
  agent role, prompt, tool, model, topology를 수작업으로 정하는 과정은 노동집약적이며 자동 code
  generation은 runtime failure가 잦다. 구조적 coherence와 탐색 범위를 함께 보장해야 한다.
claimed_cause: >-
  code generation은 executability가 취약하고 고정 template은 표현력이 낮다는 긴장을 configuration
  search로 해결한다. 성공 configuration pool과 진화 경험 memory를 다음 query에 재사용한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# EvoMAS problem framing

## Paper-specific framing

agent role, prompt, tool, model, topology를 수작업으로 정하는 과정은 노동집약적이며 자동 code generation은 runtime failure가 잦다. 구조적 coherence와 탐색 범위를 함께 보장해야 한다.

## Canonical problem

[[pr_manual_mas_design]]

## Evidence

[[ev_evomas_problem]]
