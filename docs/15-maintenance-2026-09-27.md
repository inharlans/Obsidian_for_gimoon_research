# PaperKG 유지보수 점검 — 2026-09-27

실제 저장소는 `C:\Users\user\Documents\knowloge graph`이다. 첨부 폴더
`PaperKG-Zotero-Attachments`는 코드 저장소가 아니다.

후속 작업은 [원문 검토 및 제안 적용 보강 보고서](16-curation-and-proposal-guards-2026-09-27.md)에
기록했다. 아래 83개 테스트는 1차 점검 시점이며, 후속 최종 검사는 98개다.

## 수정 및 검증 결과

| 항목 | 결과 |
| --- | --- |
| 노트 검증 | 기존 오류 51건 → 448개 노트, 오류 0 / 경고 0 |
| 의미 완결성 점검 | high / medium / low 발견사항 모두 0 |
| 테스트 | 최종 테스트 구성 83개 통과: Cloudflare 43, core/indexer/ingestion 30, MCP 6, Worker runtime 4 |
| 타입 검사·빌드 | 전체 workspace 통과, Worker는 dry-run 빌드 |
| 검색 색인 | 448개 노트, 1,023개 chunk·로컬 벡터, 399개 edge 재생성; 실제 검색 확인 |
| 원본 출처 | 등록된 SourceDocument 9개 모두 파일 존재 및 SHA-256 일치 |
| Zotero | Windows 로컬 API 정상, 등록된 파일 40개 모두 연결됨, Drive URL 첨부 40개 |
| PDF 보관 | 로컬·Drive 각 46개, 동일 이름 해시 불일치 0 |
| PDF 구조 검사 | 46개 / 1,567쪽 페이지 트리 읽기 성공, 바이트 단위 중복 0; 시각적 품질 판정은 아님 |
| 원격 MCP | health·OAuth 공개 계약 10개 검사 통과; 계정 인증 후 비공개 검색은 이번 점검에 미포함 |
| Obsidian | 수정된 PaperKG 번들 설치 완료, 이전 번들 로컬 백업; 앱 UI 재로드는 미검증 |

`pnpm check` 전체 통과 후, production vault를 읽던 중복 enum 테스트를 제거하고
fixture 전용 core 테스트를 다시 실행했다(30개 통과). 새 회귀 테스트는 15개다.

## 오류 원인과 변경 범위

9개 Method 노트의 `profile.memory_target_category`는 목록인데 기존 Zod 코드는
모든 profile 값을 문자열로만 처리했다. 새 `shares_design_facet`도 YAML 어휘에만
등록되고 런타임 predicate에서 빠져 있었다. 이 때문에 12개 노트가 파싱되지 않아
연결 오류가 추가로 발생했다. 안내용 `AGENTS.md`도 지식 노트로 검사되고 있었다.

런타임과 JSON Schema에 선택적 분류 필드를 추가했다. 기존 자유 서술 필드는
보존하고, 잘못된 enum·잘못된 관계 대상·양쪽 프로필에 실제로 없는 공통 분류는
검증 오류로 처리한다. 공통 분류 관계에는 `curator_interpreted` 출처를 요구한다.
기존 스키마 0.2.0 호환성을 위해 새 필드를 모든 Method에 필수화하지 않았다.
세 관계는 계속 `candidate`이며, 검증 통과를 사람의 학술적 승인으로 취급하지 않는다.

9개 import 작업지시서는 원본 해시가 이미 등록된 SourceDocument와 정확히 같았다.
삭제하지 않고 `status: source_registered`, `canonical_source`, 해시 대조 근거를
기록했다. 이는 원본 등록 확인이며, 요청했던 모든 학술 추출 항목의 완결성을
새롭게 인증하는 것은 아니다. 원문·페이지 추출 파일은 보존했다.

## Zotero 경로와 파일 정리

9월 18일 인수인계에는 Drive 직접 경로가 기록되어 있지만 현재 `prefs.js`와
시작 시 적용되는 `user.js`는 모두 다음 로컬 경로를 지정한다.

```text
C:\Users\user\Documents\PaperKG-Zotero-Attachments
```

현재 40개 링크가 정상이라 설정을 임의로 전환하거나 Zotero를 재시작하지 않았다.
`user.js`의 세 경로 설정(base directory, Attanger destination, Better BibTeX base)이
남아 있어 향후 UI에서 Drive로 바꿀 때 이것도 함께 갱신해야 재시작 후 유지된다.
기존 guard는 실행·시작 등록되지 않았고 이번에도 활성화하지 않았다.

Drive에만 있던 다음 두 논문의 원본·한국어·영한 교차 PDF, 총 6개를 로컬에
추가했다. 배타적 파일 생성으로 기존 파일을 덮어쓰지 않았고 SHA-256을 대조했다.

- Hu 등: Beyond RAG for Agent Memory Retrieval by Decoupling and Aggregation
- Jiang 등: SYNAPSE … Spreading Act… (보관된 파일명 기준)

이 파일들은 Zotero 라이브러리에 자동 등록하지 않았다. 파일 보관과 서지 등록은
별도이며, 현재 API에 연결 파일로 등록된 수는 여전히 40개다.

## 재실행 방법

이 checkout의 `node_modules`는 Windows용이다. WSL pnpm으로 같은 의존성 폴더를
재설치하지 않는다. 패키지 매니저를 설치 상태와 같은 `pnpm@10.8.0`으로 고정했다.
이번에는 Windows Node 24와 해당 pnpm으로 실행했다.

```powershell
pnpm check
pnpm paperkg index --vault vault/PaperKG
node scripts/audit-local-pdfs.mjs ../PaperKG-Zotero-Attachments .paperkg/operations/pdf-audit.json
python scripts/audit-zotero-attachments.py --output .paperkg/operations/zotero-attachment-audit.json
node scripts/check-paperkg-account-portability.mjs
```

이 PC에는 Windows 실행용 pnpm 10.8.0과 다음 검사 launcher도 준비되어 있다.

```powershell
& "$env:LOCALAPPDATA\PaperKG\tooling\check.ps1"
```

WSL에서 Zotero `localhost:23119`가 실패해도 Windows Python에서는 정상 연결된다.
이번에는 스킬 helper의 Windows 실행으로 API와 connector 모두 HTTP 200을 확인했다.
구 guard의 PowerShell/curl 검증기는 실제 API가 정상인데도 false를 보고했으므로
현재 점검에는 새 Python 명령을 사용한다.

상세 로컬 결과는 `.paperkg/operations/pdf-audit.json`,
`zotero-attachment-audit.json`, `maintenance-verification.json`에 있다.
이 파일들과 백업은 Git 제외 경로이며 외부에 게시하지 않았다.
PaperKG 번들과 작업지시서 백업은 `.paperkg/backups/`에 있다.

## 검수함에 남긴 후속 항목

- 분류 관계 3개는 구조적 조건만 검증됐다. 의미 있는 비교인지의 승인 여부는 유지했다.
- VAM, ReasoningBank, Zheng의 Synapse, Tan의 In Prospect and Retrospect는 아직
  정본 9개 논문에 포함되지 않는다. 원문 기반 학술 추출과 검수가 필요하다.
- 추가 PDF의 Jiang SYNAPSE와 기존 Zheng Synapse는 별개 논문으로 취급해야 한다.
- 단일 논문만 사용하는 Problem을 합치는 작업은 의미를 바꿀 수 있어 검수 제안으로
  남겼다. 코드 수리 과정에서 정본 해석을 변경하지 않았다.
- Google Drive Sync의 자동 pull은 여전히 `paperkg-local-patch` 패치에 의존한다.
  패치 존재는 확인했지만 Obsidian이 실행 중이지 않아 이번에는 실제 왕복 동기화를
  재검증하지 않았다.

커밋·push·원격 배포·스냅샷 게시 및 공개 공유 변경은 수행하지 않았다.
