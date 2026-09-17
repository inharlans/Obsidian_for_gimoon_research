---
id: pf_memgpt
type: problem_framing
schema_version: 0.2.0
title: MemGPT problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_problem]]'
tags:
  - problem-framing
  - memgpt
paper_version: '[[pv_memgpt]]'
problem: '[[pr_fixed_context]]'
framing_summary: >-
  긴 대화와 다문서 분석은 context window를 넘고 단순 truncation·summary는 중요한 정보를 잃는다. 모델은 언제
  무엇을 외부 저장소에서 page-in/out할지 제어해야 한다.
claimed_cause: >-
  fixed context를 직접 늘리면 attention 비용과 utilization 문제가 생긴다. MemGPT는 memory tier와
  interrupt/control flow를 두어 LLM이 스스로 context를 읽고 쓰고 검색하도록 한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# MemGPT problem framing

## Paper-specific framing

긴 대화와 다문서 분석은 context window를 넘고 단순 truncation·summary는 중요한 정보를 잃는다. 모델은 언제 무엇을 외부 저장소에서 page-in/out할지 제어해야 한다.

## Canonical problem

[[pr_fixed_context]]

## Evidence

[[ev_memgpt_problem]]
