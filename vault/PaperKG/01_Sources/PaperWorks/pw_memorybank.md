---
id: pw_memorybank
type: paper_work
schema_version: 0.2.0
title: 'MemoryBank: Enhancing Large Language Models with Long-Term Memory'
aliases:
  - MemoryBank
  - SiliconFriend MemoryBank
curation_status: reviewed
evidence_refs:
  - '[[ev_memorybank_problem]]'
  - '[[ev_memorybank_method]]'
  - '[[ev_memorybank_evaluation]]'
  - '[[ev_memorybank_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - agentic_memory
  - long_context
publication_year: 2024
citekey: zhongMemoryBankEnhancingLarge2024
canonical_version: '[[pv_memorybank]]'
versions:
  - '[[pv_memorybank]]'
venue_event: '[[ve_aaai_2024]]'
topics:
  - '[[rt_agentic_memory]]'
  - '[[rt_long_context]]'
external_ids:
  doi: 10.1609/aaai.v38i17.29946
  zotero_item: GWKK3HCE
  zotero_attachment: V7828HCF
---

# MemoryBank: Enhancing Large Language Models with Long-Term Memory

## 0. One-sentence contribution

대화 원문·계층형 사건 요약·사용자 portrait를 저장하고 dense retrieval과 Ebbinghaus-inspired forgetting/reinforcement로 장기 동반 기억을 관리한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_memorybank_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

LLM이 지속적 개인 대화에서 과거 사건과 personality를 기억하지 못하는 문제를 다룬다. MemoryBank를 심리대화 tuned chatbot SiliconFriend에 결합해 영어·중국어 장기 recall과 개인화를 평가한다.

## 2. Problem and motivation

개인 companion, 상담, 비서 task는 수일 이상의 대화와 사용자 성향을 기억해야 하지만 base LLM에는 안정적인 long-term memory가 없다.

- 정규화된 framing: [[pf_memorybank]]
- 공통 problem: [[pr_fixed_context]]

## 3. Contributions

- [[co_memorybank]]
- open/closed-source LLM과 영어/중국어에 적용 가능한 장기 memory mechanism과 SiliconFriend companion 사례를 제시했다.

## 4. Method

- 주 방법: [[me_memorybank]]
- chronological dialogue storage
- daily and global event summaries
- dynamic user personality portrait
- dense retrieval with FAISS
- Ebbinghaus-inspired decay and reinforcement

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_memorybank_probe]] | [[bm_memorybank_probe]] | 장기 companion의 관련 memory retrieval, answer correctness, coherence, base-model 차이 평가 | [[mt_memory_retrieval_accuracy]], [[mt_response_correctness]], [[mt_contextual_coherence]], [[mt_model_ranking]] | unknown |

## 6. Results

- 결과 묶음: [[rs_memorybank]]
- 핵심 claim: [[cl_memorybank]]
- 194 probing 질문 평가에서 영어 retrieval accuracy는 ChatGLM 0.809, BELLE 0.814, ChatGPT 0.763이고 response correctness는 각각 0.438, 0.479, 0.716이다. ChatGPT variant가 coherence와 overall ranking에서 가장 높다.

## 7. Limitations and threats

- [[lo_memorybank_simplified_forgetting]] → [[li_simplified_forgetting]] (author_stated)
- [[lo_memorybank_synthetic_evaluation]] → [[li_synthetic_evaluation]] (curator_interpreted)

## 8. Related work relations

typed relation은 [[pv_memorybank]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_memorybank]]
- Local source: [[sd_memorybank_pdf]]
- Zotero item: `GWKK3HCE`
- Zotero attachment: `V7828HCF`
- Local PDF SHA-256: `663446cf3fbaef7f1b442e3d69f0191b2b54ec97b4e78ae6dfd3fb9afa3caaba`

## 10. Evidence ledger

- Problem: [[ev_memorybank_problem]]
- Method: [[ev_memorybank_method]]
- Evaluation: [[ev_memorybank_evaluation]]
- Limitation: [[ev_memorybank_limitation]]

## 11. Curator interpretation

대화·summary·portrait를 함께 검색하면 개인화와 recall을 보완할 수 있다. 그러나 forgetting rule은 탐색적 단순 모델이며 정량 평가는 LLM이 생성한 10일 대화에 크게 의존한다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
