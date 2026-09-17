---
id: me_reflexion
type: method
schema_version: 0.2.0
title: Reflexion Verbal Reinforcement Loop
aliases:
  - Reflexion 언어적 강화 루프
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_method]]'
tags:
  - paper-method
  - reflexion
preferred_label: Reflexion Verbal Reinforcement Loop
alt_labels:
  - Reflexion 언어적 강화 루프
broader: []
narrower: []
related:
  - '[[rt_continual_agent_learning]]'
  - '[[rt_agentic_memory]]'
deprecated: false
introduced_by: '[[pv_reflexion]]'
domain_profile: agentic-memory
profile:
  memory_unit: verbal self-reflection
  write_policy: write after evaluator feedback
  organization_structure: bounded recent-reflection buffer
  update_strategy: replace or append across trials
  retrieval_strategy: inject recent reflections into the next trial
  forgetting_or_pruning: retain latest 1-3 reflections
  online_or_offline: online trial loop
preferred_label_en: Reflexion Verbal Reinforcement Loop
preferred_label_ko: Reflexion 언어적 강화 루프
---

# Reflexion Verbal Reinforcement Loop

## 정의

Actor가 trajectory를 만들고 Evaluator가 reward를 판정하면 Self-Reflection model이 trajectory와 reward를 자연어 lesson으로 요약한다. 최근 reflection을 episodic memory에 넣어 다음 Actor trial의 context로 사용하며 success까지 반복한다.

## 구성요소

- LLM Actor
- task-specific Evaluator
- verbal Self-Reflection model
- bounded episodic reflection memory
- trial-level retry and feedback loop

## 구현·평가 문맥

이 method node는 [[pv_reflexion]]에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 [[ev_reflexion_method]] 및 [[rs_reflexion]]를 따른다.
