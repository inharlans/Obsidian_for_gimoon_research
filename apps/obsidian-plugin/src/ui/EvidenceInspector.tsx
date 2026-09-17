import { Icons } from "./icons";
import { PredicateTag } from "./Status";
import type { EvidenceRecord } from "./types";
import { confidenceLabel, originLabel, statusLabel } from "./labels";

export function EvidenceInspector({ evidence, onClose }: { evidence?: EvidenceRecord | undefined; onClose?: (() => void) | undefined }) {
  if (!evidence) return <aside className="pkg-inspector pkg-inspector--empty"><h2>근거</h2><p>논문·관계·벤치마크 행을 선택하면 출처와 검수 정보를 확인할 수 있습니다.</p></aside>;
  return <aside className="pkg-inspector">
    <header><h2>근거</h2>{onClose ? <button className="pkg-icon-button" onClick={onClose} aria-label="근거 닫기"><Icons.close/></button> : null}</header>
    <section><h3>출처</h3><dl><dt>논문</dt><dd title={evidence.source}>{evidence.source}</dd><dt>버전</dt><dd title={evidence.version}>{evidence.version}</dd><dt>위치</dt><dd>{evidence.location}</dd></dl></section>
    <section><h3>주장·관계</h3><div className="pkg-relation-summary"><PredicateTag value={evidence.predicate}/><span className="pkg-mono">{evidence.target}</span></div></section>
    <section><h3>근거 요약</h3><blockquote>{evidence.summary}</blockquote></section>
    <section><h3>검수 정보</h3><dl><dt>출처 유형</dt><dd title={evidence.origin}>{originLabel(evidence.origin)}</dd><dt>검수 상태</dt><dd title={evidence.status}>{statusLabel(evidence.status)}</dd><dt>신뢰도</dt><dd title={evidence.confidence}>{confidenceLabel(evidence.confidence)}</dd></dl></section>
  </aside>;
}
