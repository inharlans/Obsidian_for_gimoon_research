# 원문 검토 후보 및 변경 제안 적용 보강 — 2026-09-27

유지보수 후속 작업 결과다. 관상 데이터셋 작업과는 무관하다.

## 원문 6편의 검토 자료

[전체 검토 문서](../.paperkg/curation/2026-09-27/REVIEW.md)에 논문별 방법 요약,
판본, 평가 범위, 한계, 분류 해석과 원문 해시를 정리했다. 물리적 PDF 페이지
번호로 근거를 연결했으며, 저자 진술과 검토자 해석을 구분했다.

| 논문 | 읽은 판본 | 제안 ID의 접미사 |
| --- | --- | --- |
| Visual Agentic Memory | arXiv 2605.16481v1, 2026-05-15 | vam |
| ReasoningBank | arXiv 2509.25140v2, 2026-03-16 | reasoningbank |
| Synapse — Zheng 등 | arXiv 2306.07863v3, 2024-01-19; ICLR 2024 표시 | synapse_zheng |
| Reflective Memory Management | ACL 2025, pp. 8416–8439 | reflective_memory |
| Beyond RAG / xMemory | arXiv 2602.02007v4, 2026-05-12 | beyond_rag |
| SYNAPSE — Jiang 등 | arXiv 2601.02744v3, 2026-02-16 | synapse_jiang |

6개 제안은 `vault/PaperKG/10_Inbox/Proposals/proposal_intake_20260927_<접미사>.json`에
있다. 각 제안은 work/version/source document, method/contribution/claim,
근거 2개, 관계 2개의 총 10개 노트를 생성한다. 모든 노트는 `candidate`다.
근거 없는 논문 간 계승 관계나 수치 성능 순위는 만들지 않았다.

각 제안을 기존 정본과 합친 임시 사본(458개 노트), 여섯 제안을 모두 합친
임시 사본(508개 노트)에서 검사했다. 모두 오류 0·경고 0이다.
[검증 기록](../.paperkg/curation/2026-09-27/validation.json)에는 제안별 내용 해시가 있다.
원본 6개 파일의 SHA-256도 생성 직전에 다시 대조했다.

현재 정본은 여전히 448개다. 이 자료는 **방법 중심의 1차 등록 제안**이며,
정량 결과 표·benchmark_use·비교 판정의 전체 추출까지 완료한 자료가 아니다.
`source_path`는 현재 Documents 아래 첨부 폴더를 가리키는 상대 경로다.
볼트만 다른 PC로 옮길 때에는 원본 파일 배치도 확인해야 한다.

검토 시 특히 확인할 내용:

- 두 Synapse는 제목·저자·판본·방법이 다른 논문이다. 단독 `Synapse` 별칭으로 합치지 않았다.
- ReasoningBank의 병렬 rollout을 공유 다중 에이전트 메모리로 분류하지 않았다.
- RMM의 reranker 학습과 메모리 구조 자체의 메타 학습은 구분했다.
- Jiang SYNAPSE는 다섯 평가 범주를 표시하지만 주요 평균 F1은 adversarial을 제외한다.
  xMemory가 네 answerable 범주를 평가한다는 사실만으로 두 평균이 불일치한다고
  단정하지 않았다. 모델·데이터 구성·평가 구현을 추가 대조해야 한다.

정본 승격은 저장소 [AGENTS.md](../AGENTS.md)의
“Machine/Codex output is a proposal until a human approves it.” 규칙을 따른다.
이번 작업에서는 승인 토큰을 발행하거나 이 후보들을 적용하지 않았다.

## Zotero 서지 정리 후보

[BibTeX 초안](../.paperkg/curation/2026-09-27/zotero-new-records.bib)은 두 항목이다:

- `hu2026xmemory`: Hu 등, Beyond RAG, arXiv 2602.02007v4.
- `jiang2026synapse`: Jiang 등, SYNAPSE, arXiv 2601.02744v3.

대상은 현재 Windows Zotero의 My Library다. 원본 PDF 첫 페이지에서 저자·제목·판본을
추출했으며 외부 메타데이터를 새로 조회하지 않았다. 가져오기·컬렉션 이동·첨부 등록은
실행하지 않았다. 적용 전 선택된 라이브러리/컬렉션을 다시 확인해야 한다.
Zotero 스킬의 쓰기 규칙은 “confirm the exact record/source and destination unless
the user's prompt already explicitly asked to add/import it.”이다.
스킬 원본: `/home/user/.codex/plugins/cache/openai-curated-remote/zotero/0.1.2/skills/zotero/SKILL.md`.

Generative Agents의 `XUL4UUCS`와 `2GDQL99A`는 제목·저자·DOI
`10.1145/3586183.3606763`가 같고, 로컬 항목 비교에서 키·버전·수정일 등 관리 정보를
제외한 차이는 태그의 자동/수동 속성뿐이었다. `XUL4UUCS`에는 연결 파일 3개,
Drive URL 3개, 메모 1개가 있고 `2GDQL99A`에는 자식 항목이 없다.
병합 검토안은 **XUL4UUCS를 기준으로 모든 첨부·메모와 두 항목의 태그를 보존**하는 것이다.
실제 병합·삭제는 하지 않았다. 상세 API 결과는 로컬
`.paperkg/curation/2026-09-27/zotero-duplicate-details.json`에 보관했다.

## 변경 제안 적용 코드

기존 적용 함수는 저장된 contentHash와 토큰만 비교했고, 실제 작업 내용의 해시를
다시 계산하지 않았다. create도 rename을 사용해 기존 파일을 덮어쓸 수 있었다.
전체 볼트 검증은 쓰기가 끝난 뒤 CLI에서 수행했다.

수정 후에는 다음을 검사한다.

- 저장·승인·적용 시 제안 내용 해시 재계산. plugin 승인에도 같은 구현 사용.
- 모든 대상의 충돌과 update의 baseSha256을 첫 쓰기 전에 확인.
- canonical note 이외 경로, 경로 탈출, symlink/junction 및 중복 경로 거부.
- 임시 볼트에 전체 작업을 반영하여 스키마·연결을 검증한 뒤 실제 적용.
- create는 배타적 hard link로 기존 파일 덮어쓰기 방지.
- 승인 토큰을 배타적으로 점유하여 같은 토큰의 동시 사용 차단.

`pnpm paperkg proposal validate <id> --vault vault/PaperKG`로 승인이나 정본 수정 없이
검증할 수 있다. 실제 CLI로 xMemory 제안 검증도 확인했다.

이 변경은 파일 단위 쓰기와 사전 검증을 보강한 것이다. 여러 파일 전체에 대한
트랜잭션/충돌 없는 동시 편집/프로세스 중단 시 자동 rollback을 제공하지 않는다.
적용 도중 디스크 오류나 외부 편집이 발생하면 부분 적용을 별도 복구해야 할 수 있다.

## 검증 및 설치

- `pnpm check` 성공: 테스트 98개(Cloudflare 43, core/indexer/ingestion 45, MCP 6, worker runtime 4), 전체 타입 검사·빌드.
- 정본 검증: 448개 노트, 오류 0·경고 0. 의미 완결성 audit 발견사항 0.
- 후보 검증: 개별 6개 및 합본 508개 노트, 오류 0·경고 0.
- 기존 PaperKG 플러그인을 `.paperkg/backups/proposal-guards-*/paperkg-plugin`에 백업하고 새 번들을 설치했다.
- Obsidian GUI에서 실제 재로드·승인 클릭은 검증하지 않았다. 다음 앱 실행/플러그인 재로드 때 설치된 번들이 사용된다.

검사 로그: `.paperkg/operations/check-continued.log`.
원문 추출·상세 검토 사본·백업은 로컬 Git 제외 경로에 있고 제안 JSON은 볼트 검수함에 있다.
커밋·push·원격 배포는 하지 않았다.
