import { useMemo, useState } from "react";
import { Icons } from "./icons";
import { ComparabilityTag, PredicateTag } from "./Status";
import { comparabilityLabel } from "./labels";
import type { Comparability, PaperRow, RelationRow } from "./types";

export function PaperLens({ papers, relations, selectedId, search, onSearch, onSelect, onOpenNote }: {
  papers: PaperRow[]; relations: RelationRow[]; selectedId?: string | undefined; search: string;
  onSearch: (value: string) => void; onSelect: (id: string, evidenceId?: string) => void; onOpenNote: (id: string) => void;
}) {
  const [problem, setProblem] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [comparability, setComparability] = useState<Comparability | "">("");
  const problems = useMemo(() => [...new Set(papers.map((paper) => paper.problem))].sort(), [papers]);
  const benchmarks = useMemo(() => [...new Set(papers.flatMap((paper) => paper.benchmarks.split(", ")).filter((value) => value !== "—"))].sort(), [papers]);
  const filtered = useMemo(() => papers.filter((paper) => (!problem || paper.problem === problem) && (!benchmark || paper.benchmarks.split(", ").includes(benchmark)) && (!comparability || paper.comparability === comparability)), [papers, problem, benchmark, comparability]);
  const selected = filtered.find((paper) => paper.id === selectedId) ?? filtered[0];
  const hasFilters = Boolean(search || problem || benchmark || comparability);
  const reset = () => { onSearch(""); setProblem(""); setBenchmark(""); setComparability(""); };
  return <div className="pkg-view">
    <div className="pkg-title-row"><div><h1>{selected?.title ?? "논문 탐색"}</h1><p>{selected?.venue ?? "조건에 맞는 논문이 없습니다."}</p></div>{selected ? <button className="pkg-secondary-button" onClick={() => onOpenNote(selected.id)}><Icons.external/>원문 노트 열기</button> : null}</div>
    <div className="pkg-toolbar">
      <label className="pkg-search"><Icons.search/><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="제목·학회·문제 검색" aria-label="논문 검색"/></label>
      <label className="pkg-filter"><span>문제</span><select value={problem} onChange={(event) => setProblem(event.target.value)}><option value="">전체</option>{problems.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="pkg-filter"><span>벤치마크</span><select value={benchmark} onChange={(event) => setBenchmark(event.target.value)}><option value="">전체</option>{benchmarks.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="pkg-filter"><span>비교</span><select value={comparability} onChange={(event) => setComparability(event.target.value as Comparability | "")}><option value="">전체</option>{(["Exact", "Partial", "Not comparable", "Unknown"] as Comparability[]).map((value) => <option key={value} value={value}>{comparabilityLabel(value)}</option>)}</select></label>
      {hasFilters ? <button className="pkg-reset" onClick={reset}>초기화</button> : null}<span className="pkg-result-count">{filtered.length}편</span>
    </div>
    <div className="pkg-table-wrap"><table className="pkg-table pkg-paper-table"><thead><tr><th>논문</th><th>학회·연도</th><th>핵심 문제</th><th>핵심 방법</th><th>주요 벤치마크</th><th>비교 가능성</th></tr></thead>
      <tbody>{filtered.map((paper) => <tr key={paper.id} className={paper.id === selected?.id ? "is-selected" : ""} onClick={() => onSelect(paper.id, paper.evidenceId)}><td>{paper.title}</td><td>{paper.venue}</td><td>{paper.problem}</td><td>{paper.method}</td><td><div className="pkg-cell-clamp" title={paper.benchmarks}>{paper.benchmarks}</div></td><td><ComparabilityTag value={paper.comparability}/></td></tr>)}</tbody>
    </table></div>
    {filtered.length === 0 ? <div className="pkg-empty pkg-empty--compact"><p>조건에 맞는 논문이 없습니다.</p><button onClick={reset}>필터 초기화</button></div> : null}
    <section className="pkg-relations"><header><h2>관계 흐름 <small>(시간순)</small></h2><span>{relations.length}개 관계</span></header>
      <div className="pkg-timeline">{relations.map((relation) => <button key={relation.id} className="pkg-timeline__row" onClick={() => onSelect(relation.id, relation.evidenceId)} title={relation.statement}><time>{relation.year}</time><span className="pkg-timeline__node"/><span className="pkg-timeline__source">{relation.source}</span><PredicateTag value={relation.predicate}/><strong>{relation.target}</strong></button>)}</div>
      <footer className="pkg-legend"><span><i className="teal"/>문제 재정의</span><span><i className="green"/>해결</span><span><i className="amber"/>미해결</span><span><i className="red"/>반박</span></footer>
    </section>
  </div>;
}
