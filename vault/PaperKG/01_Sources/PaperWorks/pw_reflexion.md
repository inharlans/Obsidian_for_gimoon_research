---
id: pw_reflexion
type: paper_work
schema_version: 0.2.0
title: 'Reflexion: Language Agents with Verbal Reinforcement Learning'
aliases:
  - Reflexion
  - Verbal Reinforcement Learning
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_problem]]'
  - '[[ev_reflexion_method]]'
  - '[[ev_reflexion_evaluation]]'
  - '[[ev_reflexion_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - continual_agent_learning
  - agentic_memory
publication_year: 2023
citekey: shinnReflexionLanguageAgents2023
canonical_version: '[[pv_reflexion]]'
versions:
  - '[[pv_reflexion]]'
venue_event: '[[ve_neurips_2023]]'
topics:
  - '[[rt_continual_agent_learning]]'
  - '[[rt_agentic_memory]]'
external_ids:
  doi: 10.52202/075280-0377
  zotero_item: KQJ8BCZZ
  zotero_attachment: EYS4MXTX
---

# Reflexion: Language Agents with Verbal Reinforcement Learning

## 0. One-sentence contribution

환경의 scalar/binary feedback을 자연어 자기성찰로 바꾸어 episodic memory에 저장하고 다음 trial의 Actor prompt를 개선한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_reflexion_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

traditional RL fine-tuning 없이 language agent가 실패에서 빠르게 배우도록 Actor, Evaluator, Self-Reflection model을 loop로 결합한다. reflection text는 semantic gradient처럼 다음 trial의 의사결정을 유도한다.

## 2. Problem and motivation

LLM agent가 환경과 상호작용하며 trial-and-error로 배우려면 기존 RL은 많은 sample과 weight update 비용이 든다. sparse feedback을 LLM이 사용할 수 있는 구체적 개선 방향으로 변환해야 한다.

- 정규화된 framing: [[pf_reflexion]]
- 공통 problem: [[pr_trial_error_learning]]

## 3. Contributions

- [[co_reflexion]]
- scalar/free-form feedback과 외부/내부 evaluator를 수용하는 verbal reinforcement framework를 decision, reasoning, coding에 적용했다.

## 4. Method

- 주 방법: [[me_reflexion]]
- LLM Actor
- task-specific Evaluator
- verbal Self-Reflection model
- bounded episodic reflection memory
- trial-level retry and feedback loop

## 5. Evaluation

| BenchmarkUse                  | Benchmark           | Purpose                                                                        | Metrics                                 | Comparability |
| ----------------------------- | ------------------- | ------------------------------------------------------------------------------ | --------------------------------------- | ------------- |
| [[bu_reflexion_alfworld]]     | [[bm_alfworld]]     | 실패 reflection이 embodied long-horizon task 재시도에 주는 학습 효과 평가                     | [[mt_success_rate]]                     | partial       |
| [[bu_reflexion_hotpotqa]]     | [[bm_hotpotqa]]     | search+reasoning 및 ground-truth context reasoning에서 reflection의 반복 개선 효과 평가    | [[mt_exact_match]], [[mt_success_rate]] | partial       |
| [[bu_reflexion_humaneval_py]] | [[bm_humaneval_py]] | self-generated tests와 verbal debugging을 통한 Python code pass@1 평가               | [[mt_pass_at_1]]                        | partial       |
| [[bu_reflexion_humaneval_rs]] | [[bm_humaneval_rs]] | compiled Rust 환경에서 self-reflection과 test generation 협력 평가                      | [[mt_pass_at_1]]                        | unknown       |
| [[bu_reflexion_mbpp_py]]      | [[bm_mbpp_py]]      | Python programming에서 generated-test 오류가 reflection 성능에 미치는 영향 평가               | [[mt_pass_at_1]]                        | partial       |
| [[bu_reflexion_mbpp_rs]]      | [[bm_mbpp_rs]]      | Rust translation에서 language-agnostic verbal debugging 성능 평가                    | [[mt_pass_at_1]]                        | unknown       |
| [[bu_reflexion_leetcode]]     | [[bm_leetcodehard]] | pretraining cutoff 이후 hard programming 문제에서 trial-based code correction 평가     | [[mt_pass_at_1]]                        | unknown       |
| [[bu_reflexion_webshop]]      | [[bm_webshop]]      | 다양한 search exploration이 필요한 task에서 verbal reflection의 local-minimum failure 분석 | [[mt_success_rate]]                     | partial       |

## 6. Results

- 결과 묶음: [[rs_reflexion]]
- 핵심 claim: [[cl_reflexion]]
- ALFWorld 134 task 중 130개를 해결했다. HumanEval Python pass@1 91.0%, Rust 68.0%, MBPP Rust 75.4%, Leetcode Hard Python 15.0%를 보고한다. WebShop에서는 ReAct보다 유의한 개선이 없어 exploration 한계를 드러냈다.

## 7. Limitations and threats

- [[lo_reflexion_local_minima]] → [[li_local_minima]] (author_stated)
- [[lo_reflexion_bounded_reflection_memory]] → [[li_bounded_reflection_memory]] (author_stated)
- [[lo_reflexion_test_quality]] → [[li_test_quality]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_reflexion]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_reflexion]]
- Local source: [[sd_reflexion_pdf]]
- Zotero item: `KQJ8BCZZ`
- Zotero attachment: `EYS4MXTX`
- Local PDF SHA-256: `efba04cd48b779131fc4c3c58ae49e8523ded534f9225a7c57c7bdad0823803d`

## 10. Evidence ledger

- Problem: [[ev_reflexion_problem]]
- Method: [[ev_reflexion_method]]
- Evaluation: [[ev_reflexion_evaluation]]
- Limitation: [[ev_reflexion_limitation]]

## 11. Curator interpretation

verbal reflection은 weight update 없이 실패 원인을 압축해 다음 시도에 재사용하지만 local minima, 작은 sliding memory, evaluator/test 품질 한계가 있다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
