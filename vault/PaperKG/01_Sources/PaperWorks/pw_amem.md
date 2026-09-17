---
id: pw_amem
type: paper_work
schema_version: 0.2.0
title: 'A-MEM: Agentic Memory for LLM Agents'
aliases:
  - A-MEM
  - A-Mem
  - Agentic Memory for LLM Agents
  - xu2025amem
curation_status: reviewed
evidence_refs:
  - '[[ev_amem_problem]]'
  - '[[ev_amem_method]]'
  - '[[ev_amem_evaluation]]'
  - '[[ev_amem_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - agentic_memory
  - continual_agent_learning
publication_year: 2025
citekey: xuAMEMAgenticMemory2025
canonical_version: '[[pv_amem]]'
versions:
  - '[[pv_amem]]'
venue_event: '[[ve_neurips_2025]]'
topics:
  - '[[rt_agentic_memory]]'
  - '[[rt_continual_agent_learning]]'
external_ids:
  doi: 10.48550/arXiv.2502.12110
  arxiv: '2502.12110'
  zotero_item: AR3EJKD8
  zotero_attachment: UFPAK45Z
---

# A-MEM: Agentic Memory for LLM Agents

## 0. One-sentence contribution

Zettelkasten식 구조화 note, 자동 link 생성, memory evolution으로 고정된 저장·검색 중심 기억을 자기조직화 기억망으로 확장한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_amem_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

기존 LLM agent memory가 기본 저장·검색과 사전 정의 schema에 묶여 다양한 task에 적응하기 어렵다고 보고, 새 기억이 기존 기억의 연결·context·attribute까지 바꾸는 agentic memory를 제안한다.

## 2. Problem and motivation

기존 memory system은 개발자가 저장 구조와 시점을 미리 정하고 graph database도 사전 schema에 의존한다. 이 고정 구조는 새 경험에서 새로운 연결과 조직 패턴을 만들기 어렵게 한다.

- 정규화된 framing: [[pf_amem]]
- 공통 problem: [[pr_rigid_memory]]

## 3. Contributions

- [[co_amem]]
- 고정 workflow 없이 memory note가 연결되고 진화하는 agentic memory architecture와 link generation/memory evolution 모듈을 제시하고 장기대화에서 평가했다.

## 4. Method

- 주 방법: [[me_amem]]
- LLM 기반 structured note construction
- embedding 후보 검색 후 LLM link generation
- 새 기억을 이용한 historical memory evolution
- query embedding과 연결 기억을 이용한 retrieval

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_amem_locomo]] | [[bm_locomo_qa]] | 장기대화 기억의 single-hop, multi-hop, temporal, open-domain, adversarial QA 성능 평가 | [[mt_f1]], [[mt_bleu1]] | partial |
| [[bu_amem_dialsim]] | [[bm_dialsim_qa]] | 장기 multi-party dialogue에서 기억 기반 QA와 응답 유사도 평가 | [[mt_f1]], [[mt_bleu1]], [[mt_rougel]] | unknown |

## 6. Results

- 결과 묶음: [[rs_amem]]
- 핵심 claim: [[cl_amem]]
- LoCoMo에서 6개 foundation model과 5개 QA category를 비교했다. DialSim에서는 F1 3.45, BLEU-1 3.37 등으로 LoCoMo·MemGPT baseline을 상회했다. Ablation에서 두 모듈을 모두 제거하면 GPT-4o-mini 기준 모든 category가 하락했다.

## 7. Limitations and threats

- [[lo_amem_underlying_model_dependency]] → [[li_underlying_model_dependency]] (author_stated)
- [[lo_amem_text_only_scope]] → [[li_text_only_scope]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_amem]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_amem]]
- Local source: [[sd_amem_pdf]]
- Zotero item: `AR3EJKD8`
- Zotero attachment: `UFPAK45Z`
- Local PDF SHA-256: `c3a1ab47a15868d91ecbcfb10e0e2dde41342f79939a23a405f54e60ca7c9b52`

## 10. Evidence ledger

- Problem: [[ev_amem_problem]]
- Method: [[ev_amem_method]]
- Evaluation: [[ev_amem_evaluation]]
- Limitation: [[ev_amem_limitation]]

## 11. Curator interpretation

자기조직화되는 연결 기억망은 장기대화에서 더 적은 retrieval context로 복합 기억을 활용할 가능성을 보였다. 다만 생성·연결 품질은 기반 LLM에 의존하고 multimodal memory는 다루지 않았다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
