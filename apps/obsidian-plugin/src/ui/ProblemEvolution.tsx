import { BenchmarkMatrix } from "./BenchmarkMatrix";
import type { BenchmarkRow, EvolutionNode, LimitationLineageItem } from "./types";

export function ProblemEvolution({ nodes, benchmarks, limitations, onSelect }: { nodes: EvolutionNode[]; benchmarks: BenchmarkRow[]; limitations: LimitationLineageItem[]; onSelect: (id: string, evidenceId?: string) => void }) {
  const recurring = [...limitations].sort((left, right) => right.occurrences - left.occurrences).slice(0, 6);
  return <div className="pkg-view pkg-view--evolution"><div className="pkg-title-row"><div><h1>문제 변화</h1><p>문제 정의를 최초 공개일 순서로 보고, 실제로 반복된 한계를 함께 확인합니다.</p></div></div>
    <div className="pkg-toolbar"><span className="pkg-basis">날짜 기준 · 최초 공개일</span><span className="pkg-neutral-note">카드 사이 선은 인과관계가 아닌 공개 순서입니다</span></div>
    <div className="pkg-evolution-canvas">{nodes.map((node, index) => <div className="pkg-evolution-step" key={node.id}><time>{node.date}</time><button className="pkg-evolution-node" onClick={() => onSelect(node.id, node.evidenceId)}><strong>{node.title}</strong><span>{node.version}</span><p>{node.summary}</p></button>{index < nodes.length - 1 ? <div className="pkg-evolution-arrow"><span>다음 공개</span></div> : null}</div>)}
      <div className="pkg-limitations"><h3>반복되는 한계</h3>{recurring.length > 0 ? recurring.map((item) => <span key={item.id}>{item.title}<small>{item.occurrences}개 논문 사례</small></span>) : <p>연결된 한계가 아직 없습니다.</p>}</div>
    </div>
    <BenchmarkMatrix rows={benchmarks} onSelect={(index) => onSelect(`benchmark-${index}`, benchmarks[index]?.evidenceId)}/>
  </div>;
}
