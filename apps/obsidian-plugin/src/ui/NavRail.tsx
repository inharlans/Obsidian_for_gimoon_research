import { Icons } from "./icons";
import type { ViewId } from "./types";

const items: Array<{ id: ViewId; label: string; icon: keyof typeof Icons }> = [
  { id: "overview", label: "한눈에 보기", icon: "graph" },
  { id: "paper", label: "논문 탐색", icon: "paper" },
  { id: "benchmark", label: "벤치마크 비교", icon: "benchmark" },
  { id: "evolution", label: "문제 변화", icon: "problem" },
  { id: "limitations", label: "한계 계보", icon: "alert" },
  { id: "versions", label: "버전 비교", icon: "graph" },
  { id: "quality", label: "데이터 품질", icon: "quality" },
  { id: "gaps", label: "연구 공백", icon: "bulb" }
];

export function NavRail({ active, onChange }: { active: ViewId; onChange: (id: ViewId) => void }) {
  return <aside className="pkg-nav">
    <div className="pkg-brand"><Icons.graph/><span>PaperKG</span></div>
    <div className="pkg-nav__section">연구 지식망</div>
    <nav aria-label="PaperKG 화면">
      {items.map((item, index) => {
        const ItemIcon = Icons[item.icon];
        return <button key={`${item.id}-${index}`} className={active === item.id ? "is-active" : ""} onClick={() => onChange(item.id)} aria-label={item.label} title={item.label}>
          <ItemIcon/><span>{item.label}</span>
        </button>;
      })}
    </nav>
    <div className="pkg-nav__footer"><span className="pkg-dot"/>정본 Markdown 연결됨</div>
  </aside>;
}
