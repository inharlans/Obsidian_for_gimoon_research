import { Icons } from "./icons";
import { ComparabilityTag } from "./Status";
import type { BenchmarkRow } from "./types";

export function BenchmarkMatrix({ rows, onSelect }: { rows: BenchmarkRow[]; onSelect: (index: number) => void }) {
  return <div className="pkg-view"><div className="pkg-title-row"><div><h1>벤치마크 비교</h1><p>평가 목적과 프로토콜이 같아야 결과를 직접 비교할 수 있습니다.</p></div></div>
    <div className="pkg-toolbar pkg-toolbar--summary"><span><Icons.filter/> {rows.length}개 평가 설정</span><span>표를 가로로 움직이면 프로토콜·지표·결과까지 확인할 수 있습니다.</span></div>
    <div className="pkg-table-wrap pkg-table-wrap--large"><table className="pkg-table pkg-benchmark-table"><thead><tr><th>논문</th><th>버전</th><th>평가 목적</th><th>데이터 분할</th><th>프로토콜</th><th>지표</th><th>기준선</th><th>구조화 결과</th><th>설정 완성도</th><th>쌍별 판정</th><th>비교 가능성</th></tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.paper}-${index}`} onClick={() => onSelect(index)}><td>{row.paper}</td><td className="pkg-mono">{row.version}</td><td>{row.purpose}</td><td>{row.split}</td><td>{row.protocol}</td><td>{row.metric}</td><td>{row.baseline}</td><td>{row.result}</td><td>{row.configuration}</td><td>{row.pairwise}</td><td><ComparabilityTag value={row.comparability}/></td></tr>)}</tbody>
    </table></div><div className="pkg-legend"><span><i className="teal"/>직접 비교 가능</span><span><i className="amber"/>일부 비교 가능</span><span><i className="red"/>직접 비교 불가</span><span><i className="gray"/>미확인</span></div>
  </div>;
}
