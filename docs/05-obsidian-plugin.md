# Obsidian plugin

## Views

- **Paper Lens**: work/version metadata, abstract, problem framing,
  contributions, methods, benchmark uses, results, limitations, relations,
  evidence, curation state, and version diff.
- **Benchmark Matrix**: paper, version, purpose, split, protocol, metric,
  result, and comparability with filters.
- **Problem Evolution**: dated framing lanes and reviewed relations such as
  `reframes`, `addresses`, and `leaves_open`.
- **Limitation Lineage**: normalized limitation, occurrences, origin, claimed
  resolution, reopening, and evidence.
- **Claim–Evidence Inspector**: claim, source passage/table/figure, metric,
  baseline, protocol, curation state, and conflicting claims.
- **Version Diff**: abstract/contribution/benchmark/baseline/result/limitation
  changes between versions.
- **Quality Dashboard**: duplicate IDs, missing required fields, dangling links,
  unsupported causal edges, incomplete protocols, and missing provenance.
- **Research Gaps**: repeated limitations, benchmark coverage, protocol
  incompatibilities, claim conflicts, and candidate ideas.
- **회의 동기화 상태**: 시작 시와 기본 15분 간격으로 원격 `ready`
  candidate를 확인하고 `검토 필요`/`정본 반영 완료` 수를 한눈에 표시한다.
  `지금 확인`은 같은 안전한 pull을 수동 실행한다.

## Data behavior

The plugin reads canonical Markdown through Obsidian's Vault and MetadataCache
APIs. It does not require the SQLite index to render. Candidate proposals remain
in the internal inbox for Codex/CLI processing and are not exposed as an
end-user review screen. Canonical writes preserve concurrent changes, validate
before commit, and never edit private source PDFs.

회의 자동 pull은 Windows 데스크톱에서 숨김 PowerShell 프로세스로
`scripts/pull-paperkg-meeting-candidates.ps1`을 실행한다. 작업공간은
`<workspace>/vault/PaperKG` 구조에서 자동 탐지하며, 필요할 때만 설정의
`PaperKG 작업공간 경로`를 지정한다. 원격 JSON과 receipt hash를 검증한 뒤
inbox candidate와 deterministic proposal만 만든다. 플러그인을 닫아도
정본 데이터에는 영향이 없고, 정본 승격은 로컬 proposal 적용이 끝나기
전까지 발생하지 않는다.

## Design behavior

The implementation follows `docs/design/design-system.md`. The evidence
inspector is persistent on wide screens and becomes a drawer on narrow screens.
Tables remain tables, timelines remain timelines, and status is conveyed by
text plus color.

사용자에게 보이는 플러그인 메뉴, 명령어, 설정, 필터, 상태, 안내문은
한국어로 제공한다. 논문 제목, 벤치마크 이름, 스키마 ID와 predicate 같은
정본 데이터는 번역해 덮어쓰지 않으며, 한국어 표시명과 원본 코드를 함께
추적할 수 있게 한다. 논문 검색과 문제·벤치마크·비교 가능성·검수 상태
필터는 실제로 동작하고, 선택한 논문의 정본 노트를 Obsidian에서 바로 연다.
