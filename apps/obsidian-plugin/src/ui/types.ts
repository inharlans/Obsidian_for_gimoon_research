export type ViewId = "overview" | "paper" | "benchmark" | "evolution" | "versions" | "limitations" | "quality" | "gaps";
export type Comparability = "Exact" | "Partial" | "Not comparable" | "Unknown";

export interface PaperRow {
  id: string;
  title: string;
  venue: string;
  problem: string;
  method: string;
  benchmarks: string;
  comparability: Comparability;
  reviewed: boolean;
  evidenceId?: string | undefined;
}

export interface RelationRow {
  id: string;
  year: string;
  predicate: string;
  source: string;
  statement: string;
  target: string;
  evidenceId?: string | undefined;
}

export interface BenchmarkRow {
  paper: string;
  version: string;
  purpose: string;
  split: string;
  protocol: string;
  metric: string;
  baseline: string;
  result: string;
  configuration: string;
  pairwise: string;
  comparability: Comparability;
  evidenceId?: string | undefined;
}

export interface EvolutionNode {
  id: string;
  date: string;
  title: string;
  version: string;
  summary: string;
  evidenceId?: string | undefined;
}

export interface EvidenceRecord {
  id: string;
  source: string;
  version: string;
  location: string;
  predicate: string;
  target: string;
  summary: string;
  origin: string;
  status: string;
  confidence: "low" | "medium" | "high";
}

export interface ReviewProposal {
  id: string;
  kind: string;
  title: string;
  files: number;
  createdAt: string;
  status: string;
}

export interface QualityIssue {
  id: string;
  severity: "Error" | "Warning";
  code: string;
  note: string;
  message: string;
}

export interface LimitationLineageItem { id: string; title: string; occurrences: number; scopes: string[]; origins: string[]; }
export interface ResearchGapItem { id: string; kind: string; title: string; summary: string; status: string; }
export interface VersionDiffItem { id: string; paper: string; left: string; right: string; changedFields: string[]; }
export interface MeetingSyncItem {
  receiptId: string;
  title: string;
  candidatePath: string;
  proposalId: string;
  status: "needs_review" | "promoted";
  contentSha256: string;
  updatedAt: string;
}

export interface WorkspaceData {
  noteCount: number;
  papers: PaperRow[];
  relations: RelationRow[];
  benchmarks: BenchmarkRow[];
  evolution: EvolutionNode[];
  evidence: EvidenceRecord[];
  proposals: ReviewProposal[];
  quality: QualityIssue[];
  limitations: LimitationLineageItem[];
  gaps: ResearchGapItem[];
  versionDiffs: VersionDiffItem[];
  meetingSync: MeetingSyncItem[];
}

export interface WorkspaceActions {
  approveProposal?: (id: string) => Promise<void>;
  rejectProposal?: (id: string) => Promise<void>;
  openNote?: (id: string) => Promise<void>;
  refresh?: () => Promise<void>;
  syncMeetings?: () => Promise<void>;
}
