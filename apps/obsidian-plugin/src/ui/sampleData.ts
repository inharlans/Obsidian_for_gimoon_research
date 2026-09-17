import type { WorkspaceData } from "./types";

export const sampleWorkspaceData: WorkspaceData = {
  noteCount: 42,
  papers: [
    { id: "pw_amem", title: "A-MEM: Agentic Memory for LLM Agents", venue: "NeurIPS 2025", problem: "Adaptive memory organization", method: "Structured linking and memory evolution", benchmarks: "LoCoMo, LongBench", comparability: "Partial", reviewed: true },
    { id: "pw_memgpt", title: "MemGPT: Towards LLMs as Operating Systems", venue: "ICLR 2024", problem: "LLM memory management", method: "Virtual context management", benchmarks: "LoCoMo", comparability: "Exact", reviewed: true },
    { id: "pw_voyager", title: "Voyager: An Open-Ended Embodied Agent", venue: "NeurIPS 2023", problem: "Open-ended exploration", method: "Skill library", benchmarks: "MineDojo", comparability: "Partial", reviewed: false },
    { id: "pw_genagents", title: "Generative Agents: Interactive Simulacra", venue: "CHI 2023", problem: "Believable agent simulation", method: "Memory-reflection-planning", benchmarks: "—", comparability: "Unknown", reviewed: false },
    { id: "pw_react", title: "ReAct: Synergizing Reasoning and Acting", venue: "ICLR 2023", problem: "Reasoning + acting", method: "Reason-act loop", benchmarks: "HotpotQA, ALFWorld", comparability: "Exact", reviewed: true }
  ],
  relations: [
    { id: "re_1", year: "2025", predicate: "reframes", source: "A-MEM", statement: "Reframes memory as an adaptive, linked research object.", target: "Adaptive memory organization" },
    { id: "re_2", year: "2024", predicate: "addresses", source: "MemGPT", statement: "Introduces explicit memory-management primitives.", target: "LLM memory management" },
    { id: "re_3", year: "2023", predicate: "builds_on", source: "Voyager", statement: "Uses acting loops with persistent retrievable context.", target: "ReAct" },
    { id: "re_4", year: "2023", predicate: "leaves_open", source: "Voyager", statement: "Long-horizon reliability remains unresolved.", target: "Long-horizon reliability" }
  ],
  benchmarks: [
    { paper: "A-MEM", version: "v1", purpose: "Evaluate adaptive memory organization", split: "LoCoMo (official)", protocol: "Standard", metric: "Avg. Acc.", baseline: "MemGPT", result: "A-MEM: reviewed score", configuration: "부분 기록", pairwise: "Partial: model, prompt", comparability: "Partial" },
    { paper: "MemGPT", version: "v1", purpose: "Evaluate OS-style memory management", split: "LoCoMo (official)", protocol: "Protocol differences", metric: "Avg. Acc.", baseline: "fixed context", result: "MemGPT: reviewed score", configuration: "부분 기록", pairwise: "Partial: model, prompt", comparability: "Partial" },
    { paper: "LongBench", version: "v1", purpose: "Long-context baseline", split: "LoCoMo (subset)", protocol: "Protocol differences", metric: "Avg. Acc.", baseline: "base model", result: "reviewed score", configuration: "부분 기록", pairwise: "Not comparable: split", comparability: "Not comparable" },
    { paper: "Unreviewed record", version: "—", purpose: "Pending review", split: "Unknown", protocol: "Unknown", metric: "Unknown", baseline: "기준선 미기록", result: "구조화 결과 없음", configuration: "정보 부족", pairwise: "공유 사용 없음", comparability: "Unknown" }
  ],
  evolution: [
    { id: "e1", date: "2023-05-15", title: "MemGPT", version: "v1", summary: "Memory management as an operating-system concern" },
    { id: "e2", date: "2024-06-18", title: "LoCoMo", version: "v1", summary: "Long-context conversational memory evaluation" },
    { id: "e3", date: "2025-02-17", title: "A-MEM", version: "v1", summary: "Adaptive, linked memory organization" }
  ],
  evidence: [
    { id: "ev_1", source: "A-MEM: Agentic Memory for LLM Agents", version: "arXiv v1", location: "Abstract / method overview", predicate: "reframes", target: "Adaptive memory organization", summary: "The paper motivates memory structures that organize and evolve rather than only store and retrieve.", origin: "author_stated", status: "Reviewed", confidence: "high" },
    { id: "ev_2", source: "Local curator note", version: "A-MEM v1", location: "Limitations", predicate: "leaves open", target: "Update reliability", summary: "Incorrect evolution and update cost require separate empirical review.", origin: "curator_interpreted", status: "Candidate", confidence: "medium" }
  ],
  proposals: [
    { id: "proposal_fixture_1", kind: "BenchmarkUse", title: "Add protocol fields for LoCoMo use", files: 2, createdAt: "2026-08-04", status: "Candidate" },
    { id: "proposal_fixture_2", kind: "Relation", title: "A-MEM reframes adaptive organization", files: 1, createdAt: "2026-08-04", status: "Candidate" }
  ],
  quality: [
    { id: "q1", severity: "Warning", code: "comparability_unknown", note: "bu_pending", message: "Protocol fields have not been reviewed." },
    { id: "q2", severity: "Warning", code: "evidence_metadata_only", note: "cl_pending", message: "Claim has metadata-only evidence." }
  ],
  limitations: [
    { id: "li_update", title: "Incorrect memory evolution", occurrences: 3, scopes: ["2023 · contamination risk", "2024 · retrieval noise", "2025 · update propagation"], origins: ["author_stated", "curator_interpreted"] },
    { id: "li_protocol", title: "Protocol incomparability", occurrences: 4, scopes: ["Evaluator", "Split", "Prompt"], origins: ["curator_interpreted"] }
  ],
  gaps: [
    { id: "ri_update", kind: "Repeated limitation", title: "Update reliability lacks a verified resolution", summary: "Derived from three reviewed limitation occurrences and leaves_open relations.", status: "machine_suggested" },
    { id: "ri_protocol", kind: "Protocol incompatibility", title: "LoCoMo uses require a controlled reproduction", summary: "Evaluator and split differences prevent direct score comparison.", status: "curator_reviewed" }
  ],
  versionDiffs: [
    { id: "pv_amem_v1-v2", paper: "A-MEM: Agentic Memory for LLM Agents", left: "arXiv v1", right: "venue version", changedFields: ["abstract", "benchmark_uses", "limitations"] }
  ],
  meetingSync: []
};
