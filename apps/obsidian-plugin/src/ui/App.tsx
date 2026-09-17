import { useMemo, useState } from "react";
import { BenchmarkMatrix } from "./BenchmarkMatrix";
import { EvidenceInspector } from "./EvidenceInspector";
import { NavRail } from "./NavRail";
import { Overview } from "./Overview";
import { PaperLens } from "./PaperLens";
import { ProblemEvolution } from "./ProblemEvolution";
import { GapsView, LimitationsView, QualityView, VersionDiffView } from "./SecondaryViews";
import type { ViewId, WorkspaceActions, WorkspaceData } from "./types";

export function PaperKgApp({ data, actions = {}, initialView = "overview", initialEvidenceOpen = false, lastLoadedAt = new Date().toISOString(), loadError }: { data: WorkspaceData; actions?: WorkspaceActions; initialView?: ViewId; initialEvidenceOpen?: boolean; lastLoadedAt?: string; loadError?: string | undefined }) {
  const [active, setActive] = useState<ViewId>(initialView);
  const [selectedId, setSelectedId] = useState(data.papers[0]?.id);
  const [evidenceId, setEvidenceId] = useState(data.evidence[0]?.id);
  const [evidenceOpen, setEvidenceOpen] = useState(initialEvidenceOpen);
  const [search, setSearch] = useState("");
  const papers = useMemo(() => data.papers.filter((paper) => `${paper.title} ${paper.venue} ${paper.problem} ${paper.benchmarks}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [data.papers, search]);
  const evidence = data.evidence.find((item) => item.id === evidenceId) ?? data.evidence[0];
  const select = (id: string, linkedEvidenceId?: string) => {
    setSelectedId(id);
    const nextEvidence = data.evidence.find((item) => item.id === linkedEvidenceId || item.id === id);
    if (nextEvidence) { setEvidenceId(nextEvidence.id); setEvidenceOpen(true); }
  };
  const navigate = (view: ViewId) => { setActive(view); if (view === "overview" || view === "quality") setEvidenceOpen(false); };
  return <div className={`paperkg-app${evidenceOpen ? "" : " is-inspector-closed"}`}>
    <NavRail active={active} onChange={navigate}/>
    <main className="pkg-main">
      <header className="pkg-header"><div className="pkg-tabs"><button className={active === "paper" ? "is-active" : ""} onClick={() => navigate("paper")}>논문 보기</button><button className={active === "benchmark" ? "is-active" : ""} onClick={() => navigate("benchmark")}>벤치마크 비교</button><button className={active === "evolution" ? "is-active" : ""} onClick={() => navigate("evolution")}>문제 변화</button></div><div className="pkg-header__right"><span className={`pkg-header__status${loadError ? " has-error" : ""}`} title={loadError}>● {loadError ? "마지막 정상 데이터 표시 중" : "정본 자동 반영 중"}</span>{active !== "overview" && active !== "quality" ? <button className="pkg-header__evidence" aria-pressed={evidenceOpen} onClick={() => setEvidenceOpen((value) => !value)}>근거 {evidenceOpen ? "숨기기" : "보기"}</button> : null}</div></header>
      {active === "overview" ? <Overview data={data} lastLoadedAt={lastLoadedAt} loadError={loadError} onNavigate={navigate} onRefresh={() => void actions.refresh?.()} onSyncMeetings={() => void actions.syncMeetings?.()}/> : null}
      {active === "paper" ? <PaperLens papers={papers} relations={data.relations} selectedId={selectedId} search={search} onSearch={setSearch} onSelect={select} onOpenNote={(id) => void actions.openNote?.(id)}/> : null}
      {active === "benchmark" ? <BenchmarkMatrix rows={data.benchmarks} onSelect={(index) => select(`benchmark-${index}`, data.benchmarks[index]?.evidenceId)}/> : null}
      {active === "evolution" ? <ProblemEvolution nodes={data.evolution} benchmarks={data.benchmarks} limitations={data.limitations} onSelect={select}/> : null}
      {active === "versions" ? <VersionDiffView diffs={data.versionDiffs}/> : null}
      {active === "limitations" ? <LimitationsView items={data.limitations}/> : null}
      {active === "quality" ? <QualityView issues={data.quality}/> : null}
      {active === "gaps" ? <GapsView items={data.gaps}/> : null}
    </main>
    {evidenceOpen ? <EvidenceInspector evidence={evidence} onClose={() => setEvidenceOpen(false)}/> : null}
  </div>;
}

export * from "./types";
export { sampleWorkspaceData } from "./sampleData";
