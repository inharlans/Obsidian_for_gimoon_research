import type { Comparability } from "./types";

const comparabilityLabels: Record<Comparability, string> = {
  Exact: "직접 비교 가능",
  Partial: "일부 비교 가능",
  "Not comparable": "직접 비교 불가",
  Unknown: "미확인"
};

const predicateLabels: Record<string, string> = {
  addresses: "해결함",
  partially_addresses: "일부 해결함",
  leaves_open: "미해결로 남김",
  reframes: "문제를 재정의함",
  inherits_problem: "문제를 이어받음",
  introduces_problem: "문제를 제기함",
  reopens: "문제를 다시 제기함",
  uses_method: "방법을 사용함",
  extends_method: "방법을 확장함",
  modifies_method: "방법을 수정함",
  combines_with: "함께 사용함",
  replaces_component: "구성요소를 대체함",
  removes_component: "구성요소를 제거함",
  supports: "근거로 뒷받침함",
  contradicts: "반박함",
  qualifies: "조건을 덧붙임",
  critiques: "비판함",
  provides_evidence_for: "근거를 제공함",
  lacks_evidence_for: "근거가 부족함",
  extends: "확장함",
  builds_on: "기반으로 삼음",
  compares_against: "비교함",
  reproduces: "재현함",
  fails_to_reproduce: "재현에 실패함",
  supersedes: "대체함",
  is_version_of: "다른 버전임",
  uses_benchmark: "벤치마크를 사용함",
  evaluates_on: "평가함",
  reports_metric: "지표를 보고함",
  uses_split: "분할을 사용함",
  uses_protocol: "프로토콜을 사용함",
  reports_result: "결과를 보고함",
  chronologically_after: "시간상 뒤에 공개됨"
};

const statusLabels: Record<string, string> = {
  inbox: "수집함",
  candidate: "검수 대기",
  reviewed: "검토 완료",
  verified: "검증 완료",
  approved: "승인됨",
  disputed: "이견 있음",
  deprecated: "사용 중단",
  rejected: "거절됨",
  machine_suggested: "AI 제안"
};

const originLabels: Record<string, string> = {
  author_stated: "저자가 명시함",
  curator_interpreted: "정리자가 해석함",
  machine_extracted: "AI가 추출함",
  machine_inferred: "AI가 추론함",
  later_work_criticism: "후속 연구가 비판함",
  reproduced: "재현으로 확인함"
};

const confidenceLabels: Record<string, string> = { low: "낮음", medium: "보통", high: "높음" };
const kindLabels: Record<string, string> = { patch: "변경안", merge: "병합", "entity merge": "개체 병합", meeting: "회의 기록", "research idea": "연구 아이디어" };
const severityLabels: Record<string, string> = { Error: "오류", Warning: "주의" };

export function comparabilityLabel(value: Comparability) { return comparabilityLabels[value]; }
export function predicateLabel(value: string) { return predicateLabels[value] ?? humanizeCode(value); }
export function statusLabel(value: string) { return statusLabels[value.toLocaleLowerCase()] ?? humanizeCode(value); }
export function originLabel(value: string) { return originLabels[value.toLocaleLowerCase()] ?? humanizeCode(value); }
export function confidenceLabel(value: string) { return confidenceLabels[value.toLocaleLowerCase()] ?? humanizeCode(value); }
export function kindLabel(value: string) { return kindLabels[value.toLocaleLowerCase()] ?? humanizeCode(value); }
export function severityLabel(value: string) { return severityLabels[value] ?? humanizeCode(value); }

export function humanizeCode(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

export function formatKoreanDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "미상";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
