---
id: pf_reflexion
type: problem_framing
schema_version: 0.2.0
title: Reflexion problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_problem]]'
tags:
  - problem-framing
  - reflexion
paper_version: '[[pv_reflexion]]'
problem: '[[pr_trial_error_learning]]'
framing_summary: >-
  LLM agent가 환경과 상호작용하며 trial-and-error로 배우려면 기존 RL은 많은 sample과 weight update
  비용이 든다. sparse feedback을 LLM이 사용할 수 있는 구체적 개선 방향으로 변환해야 한다.
claimed_cause: >-
  traditional RL fine-tuning 없이 language agent가 실패에서 빠르게 배우도록 Actor, Evaluator,
  Self-Reflection model을 loop로 결합한다. reflection text는 semantic gradient처럼 다음
  trial의 의사결정을 유도한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# Reflexion problem framing

## Paper-specific framing

LLM agent가 환경과 상호작용하며 trial-and-error로 배우려면 기존 RL은 많은 sample과 weight update 비용이 든다. sparse feedback을 LLM이 사용할 수 있는 구체적 개선 방향으로 변환해야 한다.

## Canonical problem

[[pr_trial_error_learning]]

## Evidence

[[ev_reflexion_problem]]
