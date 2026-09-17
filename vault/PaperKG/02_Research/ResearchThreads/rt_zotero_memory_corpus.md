---
id: rt_zotero_memory_corpus
type: research_thread
schema_version: 0.2.0
title: Zotero Agent Memory Corpus Timeline
aliases:
  - Zotero 에이전트 메모리 코퍼스 연대표
curation_status: reviewed
evidence_refs: []
tags:
  - zotero-local
  - timeline
  - reviewed-corpus
preferred_label: Zotero Agent Memory Corpus Timeline
alt_labels:
  - Zotero 에이전트 메모리 코퍼스 연대표
broader: []
narrower: []
related:
  - '[[rt_agentic_memory]]'
  - '[[rt_multi_agent_memory]]'
  - '[[rt_continual_agent_learning]]'
  - '[[rt_automated_agent_design]]'
deprecated: false
preferred_label_en: Zotero Agent Memory Corpus Timeline
preferred_label_ko: Zotero 에이전트 메모리 코퍼스 연대표
---

# Zotero Agent Memory Corpus Timeline

## 정의

사용자가 지정한 9편을 publication/version metadata 순으로 엮은 검수된 연구 흐름.

## Timeline

| Year | Paper | Shift in problem definition | Core mechanism | Open limitation |
|---|---|---|---|---|
| 2023 | [[pw_genagents]] | long-term believable behavior | memory–reflection–planning | retrieval, cost, robustness |
| 2023 | [[pw_memgpt]] | fixed context as virtual-memory problem | paging and function control | retrieval and function-call dependence |
| 2023 | [[pw_reflexion]] | trial feedback without weight update | verbal reflection memory | local minima and bounded memory |
| 2024 | [[pw_memorybank]] | persistent personalized companion memory | summaries, portrait, forgetting | simplified cognitive model |
| 2025 | [[pw_amem]] | rigid static organization | linked notes and memory evolution | model dependence, text-only |
| 2025 | [[pw_gmemory]] | MAS collaboration memory | insight/query/interaction hierarchy | domain breadth and error amplification |
| 2026 | [[pw_alma]] | handcrafted memory design | open-ended code-space meta-learning | offline learning and rollout cost |
| 2026 | [[pw_adamem]] | static episode-level retrieval | intra-episode strategy refresh | strategy inertia, success-only memory |
| 2026 | [[pw_evomas]] | handcrafted MAS architecture | configuration-space evolution | evolution cost, coordination scope |

## Interpretation boundary

이 표는 publication/version timestamp에 따른 기술적 이동을 요약한다. chronologically_after는 인과 또는 직접 계승을 뜻하지 않는다. 직접 비교·비판 관계는 별도 evidence-backed relation만 사용한다.

## Shared benchmark map

- ALFWorld: [[bu_adamem_alfworld]], [[bu_gmemory_alfworld]], [[bu_alma_alfworld]], [[bu_reflexion_alfworld]]
- HotpotQA: [[bu_adamem_hotpotqa]], [[bu_gmemory_hotpotqa]], [[bu_reflexion_hotpotqa]]
- WebShop: [[bu_adamem_webshop]], [[bu_reflexion_webshop]]

같은 benchmark를 공유해도 protocol note와 comparability status를 먼저 확인한다.
