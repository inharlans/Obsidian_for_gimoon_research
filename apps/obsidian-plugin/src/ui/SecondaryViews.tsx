import { Icons } from "./icons";
import type { LimitationLineageItem, QualityIssue, ResearchGapItem, VersionDiffItem } from "./types";
import { humanizeCode, kindLabel, originLabel, severityLabel, statusLabel } from "./labels";

function EmptyState({ message }: { message: string }) { return <div className="pkg-empty"><p>{message}</p></div>; }

export function LimitationsView({ items }: { items: LimitationLineageItem[] }) {
  return <div className="pkg-view"><div className="pkg-title-row"><div><h1>한계 계보</h1><p>공통 한계와 논문별 발생 사례를 검토된 Markdown에서 모아 봅니다.</p></div></div>{items.length === 0 ? <EmptyState message="아직 승인된 한계 사례가 없습니다."/> : <div className="pkg-lineage">{items.map((item) => <article key={item.id}><h2>{item.title}</h2><p>{item.occurrences}개 사례 · {item.origins.map(originLabel).join(", ") || "출처 미확인"}</p>{item.scopes.length > 0 ? <div className="pkg-lineage__lane">{item.scopes.map((scope) => <span key={scope}>{scope}</span>)}</div> : null}</article>)}</div>}</div>;
}

export function VersionDiffView({ diffs }: { diffs: VersionDiffItem[] }) {
  return <div className="pkg-view"><div className="pkg-title-row"><div><h1>버전 비교</h1><p>연속된 논문 버전 사이에서 바뀐 정본 필드를 확인합니다.</p></div></div>{diffs.length === 0 ? <EmptyState message="비교할 수 있는 승인된 논문 버전이 아직 없습니다."/> : <div className="pkg-table-wrap"><table className="pkg-table"><thead><tr><th>논문</th><th>이전 버전</th><th>다음 버전</th><th>변경된 필드</th></tr></thead><tbody>{diffs.map((diff) => <tr key={diff.id}><td>{diff.paper}</td><td>{diff.left}</td><td>{diff.right}</td><td>{diff.changedFields.map(humanizeCode).join(", ") || "구조화 필드 변경 없음"}</td></tr>)}</tbody></table></div>}</div>;
}

export function QualityView({ issues }: { issues: QualityIssue[] }) {
  const duplicateCount = issues.filter((i) => i.code === "duplicate_id").length;
  const danglingCount = issues.filter((i) => i.code.includes("dangling")).length;
  return <div className="pkg-view"><div className="pkg-title-row"><div><h1>데이터 품질</h1><p>화면을 열 때 스키마·링크·출처·관계·프로토콜 상태를 자동으로 확인합니다.</p></div><span className="pkg-auto-check"><Icons.quality/>자동 검사됨</span></div><div className="pkg-quality-summary"><span><strong>{issues.filter((i) => i.severity === "Error").length}</strong>오류</span><span><strong>{issues.filter((i) => i.severity === "Warning").length}</strong>주의</span><span><strong>{duplicateCount}</strong>중복 ID</span><span><strong>{danglingCount}</strong>끊어진 링크</span></div>{issues.length === 0 ? <EmptyState message="현재 화면 검사에서 발견된 문제가 없습니다."/> : <div className="pkg-table-wrap"><table className="pkg-table"><thead><tr><th>심각도</th><th>코드</th><th>노트</th><th>내용</th></tr></thead><tbody>{issues.map((issue) => <tr key={issue.id}><td>{severityLabel(issue.severity)}</td><td className="pkg-mono">{issue.code}</td><td>{issue.note}</td><td>{issue.message}</td></tr>)}</tbody></table></div>}</div>;
}

export function GapsView({ items }: { items: ResearchGapItem[] }) {
  return <div className="pkg-view"><div className="pkg-title-row"><div><h1>연구 공백</h1><p>연구 아이디어는 지식 사실과 분리하고, 어떤 근거에서 나왔는지 상태와 함께 보존합니다.</p></div></div>{items.length === 0 ? <EmptyState message="근거에서 도출된 연구 아이디어가 아직 없습니다."/> : <div className="pkg-gap-list">{items.map((item) => <article key={item.id}><span>{kindLabel(item.kind)}</span><h2>{item.title}</h2><p>{item.summary}</p><small>{statusLabel(item.status)}</small></article>)}</div>}</div>;
}
