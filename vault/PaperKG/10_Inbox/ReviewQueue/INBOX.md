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
