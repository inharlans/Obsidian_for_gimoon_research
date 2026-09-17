---
id: pw_memgpt
type: paper_work
schema_version: 0.2.0
title: 'MemGPT: Towards LLMs as Operating Systems'
aliases:
  - MemGPT
  - MemoryGPT
  - Towards LLMs as Operating Systems
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_problem]]'
  - '[[ev_memgpt_method]]'
  - '[[ev_memgpt_evaluation]]'
  - '[[ev_memgpt_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - long_context
  - agentic_memory
publication_year: 2023
citekey: packerMemGPTLLMsOperating2023
canonical_version: '[[pv_memgpt]]'
versions:
  - '[[pv_memgpt]]'
venue_event: '[[ve_arxiv_2024]]'
topics:
  - '[[rt_long_context]]'
  - '[[rt_agentic_memory]]'
external_ids:
  doi: 10.48550/arXiv.2310.08560
  arxiv: '2310.08560'
  zotero_item: SZMLQ5Q4
  zotero_attachment: N8E3SNLL
---

# MemGPT: Towards LLMs as Operating Systems

## 0. One-sentence contribution

LLM context를 OS의 main memory로 보고 function call로 external archival/recall storage와 paging하는 virtual-context management를 구현한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_memgpt_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

fixed context를 직접 늘리면 attention 비용과 utilization 문제가 생긴다. MemGPT는 memory tier와 interrupt/control flow를 두어 LLM이 스스로 context를 읽고 쓰고 검색하도록 한다.

## 2. Problem and motivation

긴 대화와 다문서 분석은 context window를 넘고 단순 truncation·summary는 중요한 정보를 잃는다. 모델은 언제 무엇을 외부 저장소에서 page-in/out할지 제어해야 한다.

- 정규화된 framing: [[pf_memgpt]]
- 공통 problem: [[pr_fixed_context]]

## 3. Contributions

- [[co_memgpt]]
- OS virtual memory 원리를 LLM agent에 적용해 고정 context model로 장기대화와 긴 문서 분석을 처리하는 system을 제시했다.

## 4. Method

- 주 방법: [[me_memgpt]]
- hierarchical main, recall, and archival memory
- LLM-controlled paging via function calls
- event-triggered interrupts
- function chaining and yield control
- working-context update and external vector search

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_memgpt_dmr]] | [[bm_memgpt_dmr]] | 다섯 과거 session의 narrow fact를 recall해 장기대화 consistency 평가 | [[mt_accuracy]], [[mt_rougel]] | unknown |
| [[bu_memgpt_opener]] | [[bm_memgpt_opener]] | 과거 persona 정보를 자발적으로 활용하는 다음-session opener engagement 평가 | [[mt_csim]] | unknown |
| [[bu_memgpt_docqa]] | [[bm_memgpt_docqa]] | context window를 넘는 Wikipedia document pool에서 반복 검색으로 질문 답변 | [[mt_accuracy]] | partial |
| [[bu_memgpt_nested_kv]] | [[bm_memgpt_nested_kv]] | 외부 storage에서 여러 function query를 연쇄해 multi-hop lookup 수행 | [[mt_accuracy]] | unknown |

## 6. Results

- 결과 묶음: [[rs_memgpt]]
- 핵심 claim: [[cl_memgpt]]
- MSC DMR에서 GPT-4+MemGPT accuracy 92.5%, GPT-4 Turbo+MemGPT 93.4%로 fixed-context baseline보다 높다. nested KV에서 GPT-4+MemGPT는 nesting 증가에도 성능을 유지한 반면 fixed baselines는 3단계에서 0%에 도달한다.

## 7. Limitations and threats

- [[lo_memgpt_retrieval_failure]] → [[li_retrieval_failure]] (curator_interpreted)
- [[lo_memgpt_function_calling]] → [[li_function_calling]] (curator_interpreted)

## 8. Related work relations

typed relation은 [[pv_memgpt]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_memgpt]]
- Local source: [[sd_memgpt_pdf]]
- Zotero item: `SZMLQ5Q4`
- Zotero attachment: `N8E3SNLL`
- Local PDF SHA-256: `9f674bcff69c86f11c813dcfad613d8841f5f8ed17979e3c4df06a91df7762e0`

## 10. Evidence ledger

- Problem: [[ev_memgpt_problem]]
- Method: [[ev_memgpt_method]]
- Evaluation: [[ev_memgpt_evaluation]]
- Limitation: [[ev_memgpt_limitation]]

## 11. Curator interpretation

memory hierarchy와 control flow는 fixed-context LLM에 더 큰 context의 illusion을 제공한다. 실제 성능은 retrieval quality와 function-calling 능력에 의존하며 agent가 충분히 오래 pagination하지 않고 멈추기도 한다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
