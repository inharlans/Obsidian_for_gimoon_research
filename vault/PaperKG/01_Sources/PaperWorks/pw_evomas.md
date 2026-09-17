---
id: pw_evomas
type: paper_work
schema_version: 0.2.0
title: 'EvoMAS: Evolutionary Generation of Multi-Agent Systems'
aliases:
  - EvoMAS
  - Evolutionary Generation of Multi-Agent Systems
curation_status: reviewed
evidence_refs:
  - '[[ev_evomas_problem]]'
  - '[[ev_evomas_method]]'
  - '[[ev_evomas_evaluation]]'
  - '[[ev_evomas_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - automated_agent_design
  - multi_agent_memory
publication_year: 2026
citekey: huEvoMASEvolutionaryGeneration2026
canonical_version: '[[pv_evomas]]'
versions:
  - '[[pv_evomas]]'
venue_event: '[[ve_icml_2026]]'
topics:
  - '[[rt_automated_agent_design]]'
  - '[[rt_multi_agent_memory]]'
external_ids:
  doi: 10.48550/arXiv.2602.06511
  arxiv: '2602.06511'
  zotero_item: XBKDWLET
  zotero_attachment: NSF7ZJ97
---

# EvoMAS: Evolutionary Generation of Multi-Agent Systems

## 0. One-sentence contribution

MAS를 실행 code가 아니라 구조화 configuration으로 표현하고 실행 trace 기반 selection·mutation·crossover로 task-specific architecture를 진화시킨다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_evomas_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

code generation은 executability가 취약하고 고정 template은 표현력이 낮다는 긴장을 configuration search로 해결한다. 성공 configuration pool과 진화 경험 memory를 다음 query에 재사용한다.

## 2. Problem and motivation

agent role, prompt, tool, model, topology를 수작업으로 정하는 과정은 노동집약적이며 자동 code generation은 runtime failure가 잦다. 구조적 coherence와 탐색 범위를 함께 보장해야 한다.

- 정규화된 framing: [[pf_evomas]]
- 공통 problem: [[pr_manual_mas_design]]

## 3. Contributions

- [[co_evomas]]
- configuration-based MAS generation paradigm과 cross-query experience를 축적하는 evolutionary framework를 제시하고 reasoning·coding·tool-use에서 검증했다.

## 4. Method

- 주 방법: [[me_evomas]]
- structured MAS configuration and runtime interpreter
- task-conditioned selection
- single-component mutation
- topology-preserving crossover
- pool and experience-memory consolidation

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_evomas_bbeh]] | [[bm_bbeh]] | multi-step reasoning과 tool-augmented problem solving에서 generated MAS 성능·실행률 평가 | [[mt_accuracy]], [[mt_execution_rate]], [[mt_token_usage]] | unknown |
| [[bu_evomas_swe_lite]] | [[bm_swe_lite]] | 300개 실제 software issue에서 MAS configuration evolution의 patch 해결 능력 평가 | [[mt_resolved_rate]], [[mt_execution_rate]] | partial |
| [[bu_evomas_swe_verified]] | [[bm_swe_verified]] | 500개 verified software issue에서 budget-matched MAS generation 평가 | [[mt_resolved_rate]], [[mt_token_usage]] | partial |
| [[bu_evomas_workbench]] | [[bm_workbench]] | 도메인별 workplace tool assignment와 다단계 실행 architecture 평가 | [[mt_accuracy]], [[mt_execution_rate]] | unknown |

## 6. Results

- 결과 묶음: [[rs_evomas]]
- 핵심 claim: [[cl_evomas]]
- BBEH에서 EvoAgent보다 +10.5 point, WorkBench에서 +7.1 point를 보고한다. SWE-Bench-Verified에서 Claude-4.5-Sonnet 조합은 79.1%이며 budget-matched loop보다 높다. configuration pool은 약 300–400 query 후 안정화된다고 분석한다.

## 7. Limitations and threats

- [[lo_evomas_high_adaptation_cost]] → [[li_high_adaptation_cost]] (author_stated)
- [[lo_evomas_coordination_scope]] → [[li_coordination_scope]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_evomas]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_evomas]]
- Local source: [[sd_evomas_pdf]]
- Zotero item: `XBKDWLET`
- Zotero attachment: `NSF7ZJ97`
- Local PDF SHA-256: `eb0825fda1b70a9522298d8b423fffe19d9b1cafbd183873bcfb457f8bc0892d`

## 10. Evidence ledger

- Problem: [[ev_evomas_problem]]
- Method: [[ev_evomas_method]]
- Evaluation: [[ev_evomas_evaluation]]
- Limitation: [[ev_evomas_limitation]]

## 11. Curator interpretation

bounded configuration space는 code search보다 실행 안정성을 높이며 task-adaptive coordination pattern을 발견한다. 정확도를 latency보다 우선하는 setting을 대상으로 하며 adversarial coordination과 evolution cost 절감은 남은 과제다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
