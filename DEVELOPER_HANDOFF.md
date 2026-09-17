# PaperKG 앱 개발자 인수인계

## 실제 작업 공간

```text
Repository:       C:\Users\user\Documents\knowloge graph
Canonical vault: C:\Users\user\Documents\knowloge graph\vault\PaperKG
Zotero database: C:\Users\user\Zotero
Zotero PDFs:     C:\Users\user\Documents\PaperKG-Zotero-Attachments
Drive PDF copy:  G:\내 드라이브\PaperKG-Zotero-Attachments
Vault copy:      Google Drive (계정 rlans021030@gmail.com), Obsidian 플러그인 동기화
Remote Worker:  https://paperkg-remote.nhtgb021030.workers.dev
Remote MCP:     https://paperkg-remote.nhtgb021030.workers.dev/mcp
```

## Vault의 Google Drive 동기화 (2026-09-17 변경)

vault는 Obsidian 커뮤니티 플러그인 `google-drive-sync`
(RichardX366/Obsidian-Google-Drive v3.1.1)로 Google Drive와 **양방향**
동기화한다. 목적은 ChatGPT의 Google Drive 커넥터가 vault를 읽고, 제안만
`10_Inbox/ReviewQueue`에 쓸 수 있게 하는 것이다.

- 동기화 계정은 `rlans021030@gmail.com`이다. Cloudflare/Worker가 쓰는
  `nhtgb021030@gmail.com`과 **다른 계정**이므로 혼동하지 않는다.
- 플러그인 설정에서 `Automatically push changes`가 켜져 있다. 로컬 변경은
  마지막 변경 1분 뒤 자동으로 Drive에 올라간다.
- 이전의 시간별 robocopy push(`scripts/sync-paperkg-to-google-drive.ps1`,
  예약 작업 `PaperKG Google Drive Safe Sync`)는 **비활성화**했다. 이중
  동기화를 피하기 위한 조치이며, 스크립트 자체는 남겨 두었다. 플러그인을
  걷어낼 경우 예약 작업을 다시 켜면 된다.
- `vault/PaperKG/.obsidian/plugins/google-drive-sync/data.json`에는 Google
  OAuth **refresh token이 평문으로** 저장된다. `.gitignore`에 등록되어 있으며
  절대 커밋하거나 원격에 올리지 않는다.
- 이 플러그인은 기본값에서 refresh token을 개발자 호스팅 서버
  (`https://ogd-server.richardxiong.com/api/access`)로 보내 access token으로
  교환한다. 플러그인 설정의 `Client ID`/`Client secret`에 자체 Google Cloud
  OAuth 자격증명을 넣으면 Google과 직접 교환하므로 제3자 서버를 거치지 않는다.
  현재는 기본값(제3자 서버 경유) 상태다.
- Drive 쪽에서 AI가 지켜야 할 쓰기 범위 규칙은 `vault/PaperKG/AGENTS.md`에
  있다. 이것은 프롬프트 수준의 약한 규칙이며, 실제 강제는 Drive 폴더 공유
  권한(루트 Viewer / `10_Inbox/ReviewQueue`만 Editor)으로 해야 한다. 단,
  ChatGPT가 vault 소유 계정과 **같은 계정**으로 접속하면 소유자 권한이라
  공유 권한 분리가 적용되지 않는다는 점에 주의한다.

개발자는 다음 순서로 읽는다.

1. `AGENTS.md`
2. `SPEC.md`
3. `docs/01-architecture.md`
4. `docs/02-ontology.md`
5. `docs/03-provenance-and-ingestion.md`
6. `docs/09-hosted-deployment.md`
7. `docs/10-meeting-app-integration.md`
8. `docs/api/meeting-ingestion.openapi.yaml`

## 정본과 파생물

유일한 지식 정본은 `vault/PaperKG/**/*.md`와 YAML frontmatter다. 다음은 모두 재생성하거나 다시 가져올 수 있는 운영 데이터다.

- `.paperkg/paperkg.db`
- `.paperkg/cloudflare/paperkg.snapshot.json`
- Cloudflare R2의 승인 스냅샷
- 검색 chunk와 cache
- PDF parser 결과
- D1 회의 receipt
- KV OAuth 상태

SQLite, R2, D1 또는 Worker 코드를 직접 수정해 지식 사실을 바꾸지 않는다.

## 원격 서버 코드

```text
apps/cloudflare-worker/src/index.ts     OAuth 보호·라우팅
apps/cloudflare-worker/src/auth.ts      GitHub 본인 로그인·동의·scope
apps/cloudflare-worker/src/mcp.ts       읽기 전용 MCP 도구
apps/cloudflare-worker/src/snapshot.ts  R2 승인 스냅샷 조회
apps/cloudflare-worker/src/meeting.ts   회의 candidate 수집
apps/cloudflare-worker/migrations/      D1 schema
apps/cloudflare-worker/wrangler.jsonc   실제 Cloudflare bindings/URL
```

Cloudflare Worker는 로컬 vault, Zotero 또는 Google Drive에 접근하지 않는다. 로컬에서 `reviewed/verified` 노트만 스냅샷으로 만든 뒤 명시적으로 R2에 게시한다.

## 회의 앱 구현 계약

회의 앱은 OAuth authorization-code + PKCE S256을 사용한다.

```text
resource: https://paperkg-remote.nhtgb021030.workers.dev/mcp
scope:    paperkg.meeting.submit
POST:     /mcp/v1/meeting-ingestions
GET:      /mcp/v1/meeting-ingestions/{receipt_id}
```

상세 JSON schema와 오류 처리는 `docs/api/meeting-ingestion.openapi.yaml`이 정본이다. `Idempotency-Key`는 논리적 제출 revision마다 안정적으로 유지한다. 동일 key+동일 body 재시도는 같은 receipt를 받아야 하고, 동일 key+다른 body는 `409`로 취급한다.

서버는 회의 데이터를 R2에 `.json`과 `.md` candidate로 보관하고 D1에 receipt만 기록한다. 제출물이 사실이라는 주장을 만들지 않는다. 로컬 검수함으로 가져오는 명령은 다음과 같다.

```powershell
pnpm cloudflare:pull-meetings
```

## 권한 경계

| 주체 | 권한 |
| --- | --- |
| ChatGPT | `paperkg.read`, 선택적으로 `paperkg.evidence.read` |
| 회의 앱 | `paperkg.meeting.submit` |
| 원격 Worker | 승인 스냅샷 읽기, meeting candidate 생성 |
| 로컬 사용자/CLI | candidate 검수·승인 후 canonical Markdown 수정 |
| Google Drive | Zotero linked PDF의 추가 전용 사본과 별도의 안전한 vault 복사본 |

원격 approval token 발급, canonical patch 적용, full private PDF 제공 기능을 추가하지 않는다.

## 데이터 갱신

```powershell
# canonical schema 검증 + 승인 스냅샷 R2 게시
pnpm cloudflare:publish

# Worker 코드 배포
pnpm cloudflare:deploy

# 전체 저장소 검증
pnpm check
```

스냅샷 빌더는 로컬 경로 필드와 candidate/unreviewed 노트를 제외한다. Worker 내부에서 모델 API를 호출하지 않는다. 논문 추출·정규화는 사용자가 읽기로 선택한 논문에 대해 Codex가 로컬에서 수행하고 proposal 검수 절차를 따른다.

## Zotero/Drive 경계

Zotero 데이터베이스는 반드시 `C:\Users\user\Zotero`에 둔다. Zotero의
Linked Attachment Base Directory, Attanger destination, Better BibTeX base
path는 안정 로컬 루트
`C:\Users\user\Documents\PaperKG-Zotero-Attachments`를 가리킨다. 연결 경로는
상대경로로 저장한다. Google Drive의 기존
`PaperKG-Zotero-Attachments`는 숨김 사용자 세션 guard가 누락 파일만 양방향
복사하는 사본이며, Zotero가 PDF를 여는 데 필요한 마운트가 아니다.

동일 이름·상이 해시 파일은 충돌로 중단하고 어느 쪽도 덮어쓰지 않는다.
삭제 동기화나 stored attachment 전환을 추가하지 않는다. 모바일에서는 각
논문의 metadata-only `Google Drive에서 PDF 열기` linked URL을 사용하며 공개
공유 권한을 만들지 않는다. 다른 데스크톱도 자체 안정 로컬 루트를 만든 뒤
그 로컬 경로를 Zotero/Attanger/Better BibTeX에 설정한다.

공개 MCP나 회의 앱에 Zotero local API, `zotero.sqlite`, Google OAuth 토큰, 로컬 절대 경로를 전달하지 않는다.

## 변경 전 검증

```powershell
pnpm --dir apps/cloudflare-worker typecheck
pnpm --dir apps/cloudflare-worker build
pnpm test
pnpm paperkg validate vault/PaperKG
pnpm check
```

테스트는 fixture를 사용하고 production vault에 테스트 데이터를 만들지 않는다. commit/push는 사용자의 명시적 요청 없이는 하지 않는다.
