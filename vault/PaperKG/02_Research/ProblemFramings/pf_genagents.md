---
id: pf_genagents
type: problem_framing
schema_version: 0.2.0
title: Generative Agents problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_problem]]'
tags:
  - problem-framing
  - genagents
paper_version: '[[pv_genagents]]'
problem: '[[pr_believable_long_term_behavior]]'
framing_summary: >-
  open world에서 믿을 만한 행동을 만들려면 현재 환경뿐 아니라 많은 과거 경험, 추론, 계획을 함께 고려해야 한다. 전부
  prompt에 넣을 수 없고 단순 summary는 중요한 세부를 잃는다.
claimed_cause: >-
  LLM만으로는 과거 경험을 충분히 condition하지 못해 장기 coherence가 약하다. 전체 experience record를
  검색하고 상위 reflection과 plan을 다시 memory stream에 넣는 cognitive architecture를 제안한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# Generative Agents problem framing

## Paper-specific framing

open world에서 믿을 만한 행동을 만들려면 현재 환경뿐 아니라 많은 과거 경험, 추론, 계획을 함께 고려해야 한다. 전부 prompt에 넣을 수 없고 단순 summary는 중요한 세부를 잃는다.

## Canonical problem

[[pr_believable_long_term_behavior]]

## Evidence

[[ev_genagents_problem]]
