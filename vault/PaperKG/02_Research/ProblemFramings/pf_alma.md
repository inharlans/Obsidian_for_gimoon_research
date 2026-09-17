---
id: pf_alma
type: problem_framing
schema_version: 0.2.0
title: ALMA problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_problem]]'
tags:
  - problem-framing
  - alma
paper_version: '[[pv_alma]]'
problem: '[[pr_manual_memory_design]]'
framing_summary: >-
  대화는 사용자 사실을, game은 추상 전략과 공간 affordance를 기억해야 하므로 하나의 수작업 design이 모든 domain에
  적합하지 않다. memory design 자체가 경험에서 학습되어야 한다.
claimed_cause: >-
  foundation model의 statelessness를 memory로 보완하지만 기존 memory design은 사람 손으로 고정된다.
  ALMA는 이전 design과 evaluation log를 archive에서 sample하고 새 code를 구현·debug·평가해 더 나은
  설계를 축적한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# ALMA problem framing

## Paper-specific framing

대화는 사용자 사실을, game은 추상 전략과 공간 affordance를 기억해야 하므로 하나의 수작업 design이 모든 domain에 적합하지 않다. memory design 자체가 경험에서 학습되어야 한다.

## Canonical problem

[[pr_manual_memory_design]]

## Evidence

[[ev_alma_problem]]
