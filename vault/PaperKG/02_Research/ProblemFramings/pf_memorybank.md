---
id: pf_memorybank
type: problem_framing
schema_version: 0.2.0
title: MemoryBank problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memorybank_problem]]'
tags:
  - problem-framing
  - memorybank
paper_version: '[[pv_memorybank]]'
problem: '[[pr_fixed_context]]'
framing_summary: >-
  개인 companion, 상담, 비서 task는 수일 이상의 대화와 사용자 성향을 기억해야 하지만 base LLM에는 안정적인
  long-term memory가 없다.
claimed_cause: >-
  LLM이 지속적 개인 대화에서 과거 사건과 personality를 기억하지 못하는 문제를 다룬다. MemoryBank를 심리대화 tuned
  chatbot SiliconFriend에 결합해 영어·중국어 장기 recall과 개인화를 평가한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# MemoryBank problem framing

## Paper-specific framing

개인 companion, 상담, 비서 task는 수일 이상의 대화와 사용자 성향을 기억해야 하지만 base LLM에는 안정적인 long-term memory가 없다.

## Canonical problem

[[pr_fixed_context]]

## Evidence

[[ev_memorybank_problem]]
