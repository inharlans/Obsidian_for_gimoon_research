import type { ViewId, WorkspaceData } from "./types";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "아직 없음";
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

export function Overview({ data, lastLoadedAt, loadError, onNavigate, onRefresh, onSyncMeetings }: {
  data: WorkspaceData;
  lastLoadedAt: string;
  loadError?: string | undefined;
  onNavigate: (view: ViewId) => void;
  onRefresh: () => void;
  onSyncMeetings: () => void;
}) {
  const exactBenchmarks = data.benchmarks.filter((row) => row.comparability === "Exact").length;
  return <div className="pkg-view pkg-overview">
    <div className="pkg-title-row"><div><h1>PaperKG 한눈에 보기</h1><p>지금 상태와 필요한 행동을 먼저 확인하고, 원하는 연구 질문으로 바로 이동하세요.</p></div></div>

    <section className={`pkg-trust-strip${loadError ? " has-error" : ""}`}>
      <div><strong>{loadError ? "최근 변경을 읽지 못했습니다" : "안심하고 닫아도 됩니다"}</strong><p>{loadError ? "마지막으로 정상 읽은 데이터는 그대로 보존됩니다." : "검증된 정본 파일만 화면에 반영되고, 수집 중인 후보는 내부 임시 영역에 머뭅니다."}</p></div>
      <div className="pkg-sync-state"><span className="pkg-dot"/>{loadError ? "자동 반영 재시도 대기" : `자동 반영 중 · ${formatTime(lastLoadedAt)}`}{loadError ? <button onClick={onRefresh}>다시 읽기</button> : null}</div>
    </section>

    <section className="pkg-overview-section"><header><h2>회의 지식망 동기화</h2><button onClick={onSyncMeetings}>지금 확인</button></header>
      <div className="pkg-stat-rows">
        <div><span>검토 필요</span><strong>{data.meetingSync.filter((item) => item.status === "needs_review").length}건</strong><small>정본에는 아직 반영되지 않음</small></div>
        <div><span>정본 반영 완료</span><strong>{data.meetingSync.filter((item) => item.status === "promoted").length}건</strong><small>명시적 로컬 승인 완료</small></div>
      </div>
      <p>{data.meetingSync[0] ? `최근 동기화: ${data.meetingSync[0].title} · ${formatTime(data.meetingSync[0].updatedAt)}` : "아직 가져온 회의가 없습니다. 백그라운드에서 자동으로 확인합니다."}</p>
    </section>

    <section className="pkg-overview-section"><header><h2>현재 지식 상태</h2><span>실제 정본 기준</span></header>
      <div className="pkg-stat-rows">
        <button onClick={() => onNavigate("paper")}><span>논문</span><strong>{data.papers.length}편</strong><small>구조화된 정본</small></button>
        <button onClick={() => onNavigate("benchmark")}><span>평가 설정</span><strong>{data.benchmarks.length}개</strong><small>직접 비교 가능 {exactBenchmarks}개</small></button>
        <button onClick={() => onNavigate("evolution")}><span>문제 정의</span><strong>{data.evolution.length}개</strong><small>최초 공개일 순서</small></button>
        <button onClick={() => onNavigate("limitations")}><span>공통 한계</span><strong>{data.limitations.length}개</strong><small>논문별 사례 연결</small></button>
      </div>
    </section>

    <section className="pkg-overview-section"><header><h2>이렇게 보면 됩니다</h2></header>
      <div className="pkg-guide-rows">
        <button onClick={() => onNavigate("paper")}><span>1</span><div><strong>논문 하나 이해하기</strong><p>검색하거나 행을 고른 뒤, 원문 노트와 근거를 확인합니다.</p></div></button>
        <button onClick={() => onNavigate("benchmark")}><span>2</span><div><strong>결과를 비교해도 되는지 보기</strong><p>같은 이름보다 목적·분할·프로토콜·지표가 같은지 봅니다.</p></div></button>
        <button onClick={() => onNavigate("evolution")}><span>3</span><div><strong>연구 흐름과 남은 문제 찾기</strong><p>공개 순서, 문제 정의, 반복되는 한계를 함께 봅니다.</p></div></button>
      </div>
    </section>

    <footer className="pkg-overview-footer">정본 노트 {data.noteCount}개 · 오류 {data.quality.filter((issue) => issue.severity === "Error").length}건 · 경고 {data.quality.filter((issue) => issue.severity === "Warning").length}건</footer>
  </div>;
}
