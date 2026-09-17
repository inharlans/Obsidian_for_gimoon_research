---
id: pw_alma
type: paper_work
schema_version: 0.2.0
title: Learning to Continually Learn via Meta-learning Agentic Memory Designs
aliases:
  - ALMA
  - Automated Meta-Learning of Memory Designs for Agentic Systems
curation_status: reviewed
evidence_refs:
  - '[[ev_alma_problem]]'
  - '[[ev_alma_method]]'
  - '[[ev_alma_evaluation]]'
  - '[[ev_alma_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - automated_agent_design
  - continual_agent_learning
  - agentic_memory
publication_year: 2026
first_public_date: 2026-02-08T00:00:00.000Z
citekey: xiongLearningContinuallyLearn2026
canonical_version: '[[pv_alma]]'
versions:
  - '[[pv_alma]]'
venue_event: '[[ve_iclr_memagents_2026]]'
topics:
  - '[[rt_automated_agent_design]]'
  - '[[rt_continual_agent_learning]]'
  - '[[rt_agentic_memory]]'
external_ids:
  doi: 10.48550/arXiv.2602.07755
  arxiv: '2602.07755'
  openreview: PRkA1cwXC2
  zotero_item: GMHH5T2N
  zotero_attachment: CXFCSGC7
---

# Learning to Continually Learn via Meta-learning Agentic Memory Designs

## 0. One-sentence contribution

Meta Agent가 executable code 공간에서 memory schema·update·retrieve workflow를 open-ended 탐색해 도메인별 기억 설계를 자동 발견한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_alma_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

foundation model의 statelessness를 memory로 보완하지만 기존 memory design은 사람 손으로 고정된다. ALMA는 이전 design과 evaluation log를 archive에서 sample하고 새 code를 구현·debug·평가해 더 나은 설계를 축적한다.

## 2. Problem and motivation

대화는 사용자 사실을, game은 추상 전략과 공간 affordance를 기억해야 하므로 하나의 수작업 design이 모든 domain에 적합하지 않다. memory design 자체가 경험에서 학습되어야 한다.

- 정규화된 framing: [[pf_alma]]
- 공통 problem: [[pr_manual_memory_design]]

## 3. Contributions

- [[co_alma]]
- memory design을 자동화 대상으로 명시하고 open-ended meta-learning으로 네 domain에 특화된 memory structures를 발견한다.

## 4. Method

- 주 방법: [[me_alma]]
- code-based memory-design search space
- update/retrieve modular abstraction
- performance- and novelty-aware archive sampling
- Meta Agent ideation, implementation, debugging
- memory collection/deployment evaluation

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_alma_alfworld]] | [[bm_alfworld]] | 학습된 memory design의 embodied-task continual learning, data scaling, seen→unseen adaptation 평가 | [[mt_success_rate]], [[mt_memory_cost]], [[mt_token_usage]] | partial |
| [[bu_alma_textworld]] | [[bm_textworld]] | 부분 관찰 text adventure에서 domain-specific memory design의 exploration·object strategy 재사용 평가 | [[mt_success_rate]], [[mt_memory_cost]] | unknown |
| [[bu_alma_baba]] | [[bm_baba_is_ai]] | 변하는 game rule을 위한 strategy library와 plan synthesis memory의 자동 발견 평가 | [[mt_success_rate]], [[mt_memory_cost]] | unknown |
| [[bu_alma_minihack]] | [[bm_minihack]] | procedural dungeon에서 spatial memory, risk management, long-horizon plan의 자동 설계 평가 | [[mt_success_rate]], [[mt_memory_cost]] | unknown |

## 6. Results

- 결과 묶음: [[rs_alma]]
- 핵심 claim: [[cl_alma]]
- GPT-5-mini transfer에서 ALFWorld 87.1, TextWorld 75.0, Baba Is AI 33.3, MiniHack 20.0, 평균 53.9를 보고한다. ALFWorld unseen dynamic mode는 84.1이며 평균 end-to-end memory cost는 약 $0.09, retrieval context는 1,319 tokens이다.

## 7. Limitations and threats

- [[lo_alma_offline_design_learning]] → [[li_offline_design_learning]] (author_stated)
- [[lo_alma_high_adaptation_cost]] → [[li_high_adaptation_cost]] (author_stated)
- [[lo_alma_underlying_model_dependency]] → [[li_underlying_model_dependency]] (author_stated)
- [[lo_alma_memory_robustness]] → [[li_memory_robustness]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_alma]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_alma]]
- Local source: [[sd_alma_pdf]]
- Zotero item: `GMHH5T2N`
- Zotero attachment: `CXFCSGC7`
- Local PDF SHA-256: `ae1040937265cce1036d89e6d9a57cea00e8a74b0297d92c61414b8a8d6a54a4`

## 10. Evidence ledger

- Problem: [[ev_alma_problem]]
- Method: [[ev_alma_method]]
- Evaluation: [[ev_alma_evaluation]]
- Limitation: [[ev_alma_limitation]]

## 11. Curator interpretation

도메인별 memory graph·strategy library·risk model을 자동 발견할 수 있지만 현재는 사전 정의 learning set의 offline search이며 많은 rollout 비용과 generated-code safety 검사가 필요하다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
