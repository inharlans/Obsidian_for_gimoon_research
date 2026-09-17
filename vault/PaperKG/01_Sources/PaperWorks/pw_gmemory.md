---
id: pw_gmemory
type: paper_work
schema_version: 0.2.0
title: 'G-Memory: Tracing Hierarchical Memory for Multi-Agent Systems'
aliases:
  - G-Memory
  - Tracing Hierarchical Memory for Multi-Agent Systems
curation_status: reviewed
evidence_refs:
  - '[[ev_gmemory_problem]]'
  - '[[ev_gmemory_method]]'
  - '[[ev_gmemory_evaluation]]'
  - '[[ev_gmemory_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - multi_agent_memory
  - continual_agent_learning
publication_year: 2025
citekey: zhangGMemoryTracingHierarchical2025
canonical_version: '[[pv_gmemory]]'
versions:
  - '[[pv_gmemory]]'
venue_event: '[[ve_neurips_2025]]'
topics:
  - '[[rt_multi_agent_memory]]'
  - '[[rt_continual_agent_learning]]'
external_ids:
  doi: 10.48550/arXiv.2506.07398
  arxiv: '2506.07398'
  openreview: mmIAp3cVS0
  zotero_item: EA27L9IM
  zotero_attachment: 6M7MI69C
---

# G-Memory: Tracing Hierarchical Memory for Multi-Agent Systems

## 0. One-sentence contribution

MAS의 긴 협업을 insight–query–interaction 3계층 graph로 보존하고 양방향 traversal로 agent별 추상 insight와 핵심 상호작용을 함께 검색한다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_gmemory_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

기존 MAS memory가 final artifact나 inside-trial context에 치우쳐 세밀한 협업 궤적과 cross-trial learning을 놓친다고 진단한다. G-Memory는 집단 경험을 세 계층 graph로 조직·갱신한다.

## 2. Problem and motivation

MAS trajectory는 single agent보다 훨씬 길고 agent별 역할과 발화 관계를 포함한다. 전체 trajectory를 그대로 넣으면 정보 과부하가 생기고 지나치게 압축하면 collaboration lesson을 잃는다.

- 정규화된 framing: [[pf_gmemory]]
- 공통 problem: [[pr_mas_memory]]

## 3. Contributions

- [[co_gmemory]]
- MAS self-evolution의 memory bottleneck을 정의하고, 기존 framework를 수정하지 않고 연결할 수 있는 3계층 agentic memory를 제시한다.

## 4. Method

- 주 방법: [[me_gmemory]]
- interaction graph for utterance-level collaboration
- query graph with task status and semantic edges
- insight graph with supporting-query hyper-connections
- coarse retrieval and bi-directional traversal
- agent-specific memory projection and joint update

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_gmemory_alfworld]] | [[bm_alfworld]] | MAS 협업 기억이 household embodied action success에 미치는 효과 평가 | [[mt_success_rate]], [[mt_token_usage]] | partial |
| [[bu_gmemory_scienceworld]] | [[bm_scienceworld]] | 과학 실험 embodied task에서 cross-trial collaborative experience 활용 평가 | [[mt_progress_rate]] | unknown |
| [[bu_gmemory_pddl]] | [[bm_pddl]] | 전략 game에서 block/action 제약과 협업 trajectory memory 평가 | [[mt_progress_rate]] | unknown |
| [[bu_gmemory_hotpotqa]] | [[bm_hotpotqa]] | multi-agent web search와 여러 supporting fact 합성에서 memory cue 효과 평가 | [[mt_exact_match]] | partial |
| [[bu_gmemory_fever]] | [[bm_fever]] | web evidence 기반 fact verification에서 agent-specific insight와 interaction retrieval 평가 | [[mt_exact_match]] | unknown |

## 6. Results

- 결과 묶음: [[rs_gmemory]]
- 핵심 claim: [[cl_gmemory]]
- GPT-4o-mini 기반 표에서 AutoGen 평균 57.18, DyLAN 50.88, MacNet 51.95로 no-memory와 여러 single/MAS memory baseline을 상회한다. interaction-only와 insight-only ablation 모두 full hierarchy보다 낮다.

## 7. Limitations and threats

- [[lo_gmemory_limited_domain_validation]] → [[li_limited_domain_validation]] (author_stated)
- [[lo_gmemory_memory_error_amplification]] → [[li_memory_error_amplification]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_gmemory]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_gmemory]]
- Local source: [[sd_gmemory_pdf]]
- Zotero item: `EA27L9IM`
- Zotero attachment: `6M7MI69C`
- Local PDF SHA-256: `83c63dbde7619a1574c136432121772967b75455b5fee70016e85f522d0a8ce6`

## 10. Evidence ledger

- Problem: [[ev_gmemory_problem]]
- Method: [[ev_gmemory_method]]
- Evaluation: [[ev_gmemory_evaluation]]
- Limitation: [[ev_gmemory_limitation]]

## 11. Curator interpretation

hierarchical abstraction과 fine-grained collaboration segment를 함께 제공하면 MAS가 cross-trial 경험을 재사용할 수 있다. 다섯 benchmark 밖의 의료 등 고위험 도메인 검증과 잘못된 기억의 amplification 방지가 필요하다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
