---
id: pw_adamem
type: paper_work
schema_version: 0.2.0
title: 'AdaMEM: Test-Time Adaptive Memory for Language Agents'
aliases:
  - AdaMEM
  - Adaptive Memory Agent
curation_status: reviewed
evidence_refs:
  - '[[ev_adamem_problem]]'
  - '[[ev_adamem_method]]'
  - '[[ev_adamem_evaluation]]'
  - '[[ev_adamem_limitation]]'
tags:
  - zotero-local
  - reviewed-corpus
  - agentic_memory
  - continual_agent_learning
publication_year: 2026
first_public_date: 2026-06-04T00:00:00.000Z
citekey: zhangAdaMEMTestTimeAdaptive2026
canonical_version: '[[pv_adamem]]'
versions:
  - '[[pv_adamem]]'
venue_event: '[[ve_icml_2026]]'
topics:
  - '[[rt_agentic_memory]]'
  - '[[rt_continual_agent_learning]]'
external_ids:
  doi: 10.48550/arXiv.2606.05684
  arxiv: '2606.05684'
  zotero_item: AUC7Z35X
  zotero_attachment: WSKWS39R
---

# AdaMEM: Test-Time Adaptive Memory for Language Agents

## 0. One-sentence contribution

offline 성공 궤적 long-term memory와 현재 state에 맞춰 온라인 생성하는 short-term strategy memory를 결합해 episode 중에도 행동을 적응시킨다.

## 1. Abstract

### 1.1 Original abstract

원문은 [[sd_adamem_pdf]]의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.

### 1.2 Korean structured abstract

episode 시작 때 한 번만 기억을 검색하는 정적 방식은 긴 task가 진행되면서 guidance가 낡는다. AdaMEM은 parameter update 없이 필요한 step에서 성공 궤적을 검색하고 state-specific strategy를 합성한다.

## 2. Problem and motivation

기존 trajectory·strategy memory는 episode initiation에 retrieval을 front-load하므로 중간 실패와 sub-goal 변화에 대응하기 어렵다. 과도한 online parameter update 없이 intra-episode adaptation이 필요하다.

- 정규화된 framing: [[pf_adamem]]
- 공통 problem: [[pr_rigid_memory]]

## 3. Contributions

- [[co_adamem]]
- memory storage와 abstraction을 분리한 hybrid architecture, 조절 가능한 inference-time adaptation effort, process-level strategy fine-tuning을 제시한다.

## 4. Method

- 주 방법: [[me_adamem]]
- offline successful-trajectory long-term memory
- online state-conditioned short-term strategy synthesis
- HIGH/LOW adaptation-effort modes
- STEP-MFT action-change filtering and fine-tuning

## 5. Evaluation

| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |
|---|---|---|---|---|
| [[bu_adamem_alfworld]] | [[bm_alfworld]] | 동적 state 변화와 novel room layout에서 embodied task 적응 평가 | [[mt_success_rate]], [[mt_token_usage]] | partial |
| [[bu_adamem_webshop]] | [[bm_webshop]] | homepage의 정보 부족과 중간 검색 상태 변화에서 dynamic retrieval 효과 평가 | [[mt_task_score]], [[mt_token_usage]] | partial |
| [[bu_adamem_hotpotqa]] | [[bm_hotpotqa]] | 여러 episode에 걸친 agentic search와 answer refinement 평가 | [[mt_success_rate]], [[mt_exact_match]] | partial |

## 6. Results

- 결과 묶음: [[rs_adamem]]
- 핵심 claim: [[cl_adamem]]
- training-free on-policy에서 ALFWorld seen 54.0±2.9, unseen 58.2±3.9, WebShop 74.2±0.3을 보고했다. HotpotQA cross-episode success는 41.1±0.5이다. short-term 또는 long-term memory를 제거한 ablation은 모두 full variant보다 낮았다.

## 7. Limitations and threats

- [[lo_adamem_strategy_inertia]] → [[li_strategy_inertia]] (author_stated)
- [[lo_adamem_success_only_memory]] → [[li_success_only_memory]] (author_stated)

## 8. Related work relations

typed relation은 [[pv_adamem]]와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.

## 9. Version and source

- Canonical version: [[pv_adamem]]
- Local source: [[sd_adamem_pdf]]
- Zotero item: `AUC7Z35X`
- Zotero attachment: `WSKWS39R`
- Local PDF SHA-256: `e370959c47560560dfa445aac46650f7a585186d69c1c21a7230c860fd6c64a9`

## 10. Evidence ledger

- Problem: [[ev_adamem_problem]]
- Method: [[ev_adamem_method]]
- Evaluation: [[ev_adamem_evaluation]]
- Limitation: [[ev_adamem_limitation]]

## 11. Curator interpretation

dynamic short-term strategy는 static initialization의 rigidity를 완화하지만 refresh 판단이 실패하면 obsolete strategy에 갇힐 수 있고, 실패 trajectory를 memory에 포함하는 원칙도 남아 있다.

## 12. Open questions

- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?
- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?
- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?
