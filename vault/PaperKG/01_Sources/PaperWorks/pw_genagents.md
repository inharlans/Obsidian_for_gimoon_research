---
id: pw_genagents
type: paper_work
schema_version: 0.2.0
title: 'Generative Agents: Interactive Simulacra of Human Behavior'
aliases:
  - Generative Agents
  - Interactive Simulacra of Human Behavior
curation_status: reviewed
evidence_refs:
  - '[[ev_genagents_problem]]'
  - '[[ev_genagents_method]]'
  - '[[ev_genagents_evaluation]]'
  - '[[ev_genagents_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - social_simulation
  - agentic_memory
publication_year: 2023
citekey: parkGenerativeAgentsInteractive2023
canonical_version: '[[pv_genagents]]'
versions:
  - '[[pv_genagents]]'
venue_event: '[[ve_uist_2023]]'
topics:
  - '[[rt_social_simulation]]'
  - '[[rt_agentic_memory]]'
external_ids:
  doi: 10.1145/3586183.3606763
  arxiv: '2304.03442'
  zotero_item: XUL4UUCS
  zotero_attachment: SSTEQSNI
---

# Generative Agents: Interactive Simulacra of Human Behavior

## 0. One-sentence contribution

자연어 memory stream, recency·importance·relevance retrieval, reflection, hierarchical planning을 결합해 25개 agent가 장기적이고 emergent한 사회 행동을 만들게 한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_genagents_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

LLM만으로는 과거 경험을 충분히 condition하지 못해 장기 coherence가 약하다. 전체 experience record를 검색하고 상위 reflection과 plan을 다시 memory stream에 넣는 cognitive architecture를 제안한다.

## 2. Problem and motivation

open world에서 믿을 만한 행동을 만들려면 현재 환경뿐 아니라 많은 과거 경험, 추론, 계획을 함께 고려해야 한다. 전부 prompt에 넣을 수 없고 단순 summary는 중요한 세부를 잃는다.

- 정규화된 framing: [[pf_genagents]]
- 공통 problem: [[pr_believable_long_term_behavior]]

## 3. Contributions

- [[co_genagents]]
- 기억·성찰·계획을 통합한 생성 에이전트 architecture와 25-agent sandbox를 제시하고 controlled ablation 및 end-to-end 사회 시뮬레이션으로 평가했다.

## 4. Method

- 주 방법: [[me_genagents]]
- complete natural-language memory stream
- recency–importance–relevance retrieval
- recursive higher-level reflection
- hierarchical daily planning and reaction
- Smallville multi-agent sandbox

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_genagents_controlled]] | [[bm_genagents_interview]] | self-knowledge, memory, plan, reaction, reflection 응답의 believability와 architecture component 기여 평가 | [[mt_believability_rank]] | unknown |
| [[bu_genagents_smallville]] | [[bm_genagents_smallville]] | open-ended multi-agent simulation에서 정보 확산, 관계 형성, event coordination과 오류 경계 관찰 | [[mt_social_outcomes]] | unknown |

## 6. Results

- 결과 묶음: [[rs_genagents]]
- 핵심 claim: [[cl_genagents]]
- 100명 within-subject ranking에서 full architecture가 ablation보다 우수했다. 이틀 뒤 Sam의 출마는 1명에서 8명, Isabella의 party는 1명에서 13명에게 확산됐고 관계 network density는 0.167에서 0.74로 증가했으며 초대 12명 중 5명이 참석했다.

## 7. Limitations and threats

- [[lo_genagents_retrieval_failure]] → [[li_retrieval_failure]] (author_stated)
- [[lo_genagents_high_adaptation_cost]] → [[li_high_adaptation_cost]] (author_stated)
- [[lo_genagents_memory_robustness]] → [[li_memory_robustness]] (author_stated)
- [[lo_genagents_model_bias]] → [[li_model_bias]] (author_stated)
- [[lo_genagents_limited_domain_validation]] → [[li_limited_domain_validation]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_genagents]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_genagents]]
- Local source: [[sd_genagents_pdf]]
- Zotero item: `XUL4UUCS`
- Zotero attachment: `SSTEQSNI`
- Local PDF SHA-256: `1b31e77fb24d25d7598f2c49e955d12a28b95a6dabad34acdac40f44bfb7a139`

## 10. Evidence ledger

- Problem: [[ev_genagents_problem]]
- Method: [[ev_genagents_method]]
- Evaluation: [[ev_genagents_evaluation]]
- Limitation: [[ev_genagents_limitation]]

## 11. Curator interpretation

memory, reflection, planning의 조합은 장기 사회 행동의 coherence를 높이지만 retrieval error, embellishment, 환경 norm 오해, instruction-tuning bias가 나타났다. 25 agent 이틀 simulation은 수천 달러와 여러 날이 들었다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
