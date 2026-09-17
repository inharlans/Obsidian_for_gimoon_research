# PaperKG visual system

The accepted visual references are `paperkg-primary-concept.png` and
`paperkg-synthesis-concept.png` in this directory.

## 화면 문구 기준

기본 UI 언어는 한국어다. 왼쪽 메뉴는 `논문 탐색`, `벤치마크 비교`,
`문제 변화`, `한계 계보`, `버전 비교`, `데이터 품질`,
`연구 공백`을 사용한다. 기본 탭은 `논문 보기`, `벤치마크 비교`,
`문제 변화`다. 근거 패널은 `출처`, `주장·관계`, `근거 요약`,
`검수 정보`로 구성한다. 비교 가능성은 `직접 비교 가능`,
`일부 비교 가능`, `직접 비교 불가`, `미확인`으로 표시하되,
내부 스키마 값과 predicate는 바꾸지 않고 툴팁에 보존한다.

## Tokens

- Background: `#0b1116`; surface: `#111a21`; raised surface: `#162129`.
- Text: `#edf2f2`; muted: `#9aa8ad`; border: `#2a3941`.
- Relation/selection: `#39c7c4`; evidence/warning: `#dba72b`.
- Success: `#4fb87b`; danger: `#e05b61`.
- Radius: 6px controls, 8px panels. Shadows are minimal.
- Content typography: system sans, 14px/1.45. UI chrome: 12px/1.35.
- Metadata: system monospace, 11px/1.4.

## Container and component model

The product uses rails, open tables, chronological lanes, and a persistent
evidence inspector. It does not use nested cards, bento grids, decorative
badges, gradients, glow, or fake metrics. Relationship types are communicated
by text and restrained line color, never color alone.

## Icon inventory

Navigation uses 16px outline icons with 1.5px strokes: graph, document,
benchmark/scale, problem/info, limitation/alert, search, filter,
columns, and close. Chevron and overflow controls use SVG rather than text
glyphs. Selected icons use teal; evidence uses amber.

## Responsive behavior

PaperKG 컨테이너 폭이 1250px 아래면 근거 패널은 서랍이 된다. 820px
아래면 왼쪽 메뉴가 아이콘 레일로 줄어든다. 표는 가로 스크롤을
제공하며 핵심 논문·근거 내용이 잘리지 않아야 한다.
