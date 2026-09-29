---
id: rq_inbox
type: review_inbox
schema_version: 0.2.0
title: ReviewQueue shared inbox
curation_status: candidate
---

# ReviewQueue shared inbox

이 파일은 Google Drive를 통해 접근하는 AI(예: ChatGPT의 Drive 커넥터)가 제안을
적어 넣는 **유일한 쓰기 대상**이다.

## 왜 새 파일이 아니라 이 파일인가

Obsidian의 `google-drive-sync` 플러그인은 OAuth 스코프 `drive.file`로 동작한다.
이 스코프는 **플러그인이 직접 만든 파일만** 볼 수 있게 제한한다. 따라서 Drive에서
외부 도구가 새로 만든 파일은 플러그인이 영원히 발견하지 못하고, 볼트로 내려오지
않는다. 반면 이 파일처럼 플러그인이 만든 파일은 다른 계정이 내용을 수정해도
계속 동기화 대상으로 남는다.

## 쓰는 방법

- 새 파일을 만들지 말고 이 파일 **맨 아래에 이어쓴다**.
- 항목마다 아래 형식을 지킨다. 사람이 검수한 뒤 정본 노트로 승격하거나 삭제한다.
- 기존 항목을 수정하거나 지우지 않는다.

```
## [제안] <한 줄 제목>
- 작성: <도구/모델 이름>, <ISO 날짜>
- 근거: <읽은 볼트 파일 경로 또는 원문 위치>
- 내용: <본문>
- 상태: 검토 대기
```

---

<!-- 아래부터 제안을 이어쓴다 -->

## [제안] ALMA 개방형 코드 공간 메모리 설계 요약
- 작성: ChatGPT (GPT-6 Astra Pro), 2026-09-17
- 근거: `02_Research/Methods/me_alma.md`
- 내용: ALMA(Open-Ended Code-Space Memory Design)는 단일 에이전트의 메모리 설계 자체를 실행 가능한 코드 공간에서 메타 학습으로 탐색하는 방법이다. 메모리 모듈을 `general_update`와 `general_retrieve` 인터페이스 및 선택적 하위 모듈·데이터베이스로 추상화하고, Meta Agent가 성능과 새로움을 고려해 아카이브에서 기존 설계 코드·성공률·층화된 로그를 참조하여 아이디어와 계획을 세운 뒤 Python 코드로 구현한다. 후보 설계는 샌드박스 실행·디버깅과 벤치마크 평가를 거쳐 평가 로그와 함께 아카이브에 축적되며 후속 설계 탐색에 활용된다. 오프라인 학습 후 배포하는 구조로 반복 실행과 평가 비용이 크고, 원문은 세부 절차와 실험 결과의 참조 대상으로 [[ev_alma_method]]와 [[rs_alma]]를 연결한다.
- 상태: 검토 대기


## [제안] 2026-09-27 유지보수 후 남은 학술·서지 검수
- 작성: Codex, 2026-09-27
- 근거: `06_Relations/re_alma_shares_evomas_design_space.md`, `06_Relations/re_adamem_shares_reflexion_strategy_policy.md`, `06_Relations/re_evomas_shares_gmemory_multi_agent.md`; `01_Sources/SourceDocuments/` 9개 해시 대조; 로컬 PDF·Zotero API 재고 확인
- 내용: 공통 분류 관계 3개는 런타임 검증을 통과했으나 계속 candidate다. 두 방법이 같은 분류 값을 갖는다는 조건만 확인했으며, 학술적으로 의미 있는 연결인지의 검수는 별도다. VAM·ReasoningBank·Zheng Synapse·Tan In Prospect and Retrospect는 현재 정본 9개 논문에 포함되지 않는다. Drive에서 로컬로 보완한 Hu Beyond RAG 및 Jiang SYNAPSE의 PDF 6개는 아직 Zotero 항목으로 등록되지 않았다. 특히 Jiang SYNAPSE와 Zheng Synapse를 이름만으로 병합하지 않아야 한다. 단일 논문용 Problem의 병합도 의미 검수 후 제안으로 진행한다. 상세 운영 결과는 저장소 `docs/15-maintenance-2026-09-27.md`에 있다.
- 상태: 검토 대기

## [제안] 원문 6편의 방법 중심 등록 및 Zotero 서지 정리 후보
- 작성: Codex, 2026-09-27
- 근거: VAM PDF pp. 4–7, ReasoningBank pp. 4–6, Zheng Synapse pp. 4–6, RMM pp. 3–5, xMemory pp. 3–5, Jiang SYNAPSE pp. 3–5; 각 원본 SHA-256과 판본 메타데이터; Zotero 로컬 API 항목 대조
- 내용: 논문별 10개 노트, 총 60개 candidate 노트를 6개 proposal_intake_20260927_* 제안으로 준비했다. 개별 및 기존 정본과 합친 508개 노트 임시 검증은 오류·경고 0이다. 방법·기여·방법 주장·근거·버전 관계 중심이며 정량 결과와 논문 간 비교의 완전 추출은 포함하지 않는다. 정본은 448개로 유지했다. 상세 검토는 저장소 `.paperkg/curation/2026-09-27/REVIEW.md`, 운영 보고서는 `docs/16-curation-and-proposal-guards-2026-09-27.md`에 있다. Zotero 미등록 xMemory/Jiang SYNAPSE는 2건 BibTeX 초안을 만들었다. Generative Agents의 동일 DOI 두 항목은 첨부 6개·메모 1개가 있는 XUL4UUCS를 보존하는 병합 검토안으로 기록했다. 실제 승인·등록·병합은 수행하지 않았다.
- 상태: 검토 대기

## [제안] xMemory·Jiang SYNAPSE Zotero 등록 완료 및 facet 컬렉션 구성
- 작성: Claude Code, 2026-09-29
- 근거: Zotero 로컬 API 조회(항목·첨부·컬렉션), arXiv API 메타데이터(`2602.02007v4`, `2601.02744v3`), `proposal_intake_20260927_beyond_rag`·`_synapse_jiang`의 Method profile
- 내용: 9/27 Codex 제안 "원문 6편의 방법 중심 등록 및 Zotero 서지 정리 후보"에 적힌 "Zotero 미등록" 상태가 해소되었다. Hu 2026 xMemory는 `JJT9L6TB`(preprint), Jiang 2026 SYNAPSE는 `3FMVZQY2`(conferencePaper, Findings of ACL 2026)로 등록했고 각각 파일 링크 3개(`attachments:` 상대경로)와 Drive 링크 3개를 붙였다. 두 proposal을 승격할 때 `pw_*`의 `external_ids.zotero_item`에 이 키를 넣는다. Zotero에 `PaperKG · Agentic Memory` 아래 facet 컬렉션 8개(기억 대상 5개, 메모리 설계 자동화, 멀티에이전트 공유 메모리)를 만들고 15편을 배정했다. 배정은 정본 9편의 Method profile과 미승격 6편의 proposal profile을 따른다. 미승격 6편의 facet은 아직 검수 전이므로, 검수에서 값이 바뀌면 컬렉션도 함께 옮긴다. Generative Agents 중복(`2GDQL99A`, 첨부 0개)과 `sync [Zotero Documentation]` 웹페이지 항목은 건드리지 않았다.
- 상태: 검토 대기

## [제안] Generative Agents Zotero 중복 병합
- 작성: Claude Code, 2026-09-29
- 근거: `.paperkg/curation/2026-09-27/zotero-duplicate-details.json`의 두 레코드 비교, `01_Sources/PaperWorks/pw_genagents.md`의 `external_ids.zotero_item`
- 내용: 바로 앞 기록에서 "건드리지 않았다"고 한 Generative Agents 중복을 이후 처리했다. `2GDQL99A`는 `XUL4UUCS`와 제목·DOI·저자 6명·태그·추가 시각(초 단위)까지 같고 첨부·메모가 0개였다. 볼트 정본 `pw_genagents`·`pv_genagents`가 참조하는 `XUL4UUCS`를 남기고 `2GDQL99A`를 병합했다. 병합 코드는 제목·DOI가 다르거나 중복 쪽에 자식이 있으면 중단하도록 했다. 중복 항목은 Zotero 휴지통에 있어 복원할 수 있다. 볼트 노트는 바꿀 필요가 없다. `sync [Zotero Documentation]` 웹페이지 항목은 사용자가 저장했을 수 있어 그대로 두었다.
- 상태: 검토 대기
