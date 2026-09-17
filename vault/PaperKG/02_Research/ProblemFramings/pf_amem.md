---
id: pf_amem
type: problem_framing
schema_version: 0.2.0
title: A-MEM problem framing
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_problem]]'
tags:
  - problem-framing
  - amem
paper_version: '[[pv_amem]]'
problem: '[[pr_rigid_memory]]'
framing_summary: >-
  기존 memory system은 개발자가 저장 구조와 시점을 미리 정하고 graph database도 사전 schema에 의존한다. 이 고정
  구조는 새 경험에서 새로운 연결과 조직 패턴을 만들기 어렵게 한다.
claimed_cause: >-
  기존 LLM agent memory가 기본 저장·검색과 사전 정의 schema에 묶여 다양한 task에 적응하기 어렵다고 보고, 새 기억이
  기존 기억의 연결·context·attribute까지 바꾸는 agentic memory를 제안한다.
assertion_origin: author_stated
evidence_status: faithful_paraphrase
---

# A-MEM problem framing

## Paper-specific framing

기존 memory system은 개발자가 저장 구조와 시점을 미리 정하고 graph database도 사전 schema에 의존한다. 이 고정 구조는 새 경험에서 새로운 연결과 조직 패턴을 만들기 어렵게 한다.

## Canonical problem

[[pr_rigid_memory]]

## Evidence

[[ev_amem_problem]]
