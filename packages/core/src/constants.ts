export const SCHEMA_VERSION = "0.2.0" as const;

export const NODE_TYPES = [
  "paper_work", "paper_version", "source_document", "author", "organization",
  "venue_series", "venue_event", "artifact", "contribution", "problem",
  "problem_framing", "research_question", "claim", "method", "system",
  "component", "assumption", "conclusion", "future_work", "task", "dataset",
  "benchmark", "benchmark_use", "protocol", "metric", "baseline", "experiment",
  "result_set", "comparison_assessment", "ablation", "error_analysis", "reproduction_attempt", "limitation",
  "limitation_occurrence", "threat_to_validity", "research_thread", "relation",
  "research_idea", "evidence", "meeting_record", "person", "decision",
  "action_item", "open_question", "requirement", "risk", "announcement",
  "member_update", "question_answer", "presented_paper"
] as const;

export const CURATION_STATUSES = [
  "inbox", "candidate", "reviewed", "verified", "disputed", "deprecated",
  "rejected"
] as const;

export const ASSERTION_ORIGINS = [
  "author_stated", "curator_interpreted", "machine_extracted",
  "machine_inferred", "later_work_criticism", "reproduced",
  "participant_stated", "meeting_summary"
] as const;

export const EVIDENCE_STATUSES = [
  "exact_quote", "faithful_paraphrase", "table_derived", "figure_derived",
  "metadata_only", "missing"
] as const;

export const COMPARABILITY_STATUSES = [
  "exact", "partial", "not_comparable", "unknown"
] as const;

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type NodeType = (typeof NODE_TYPES)[number];
export type CurationStatus = (typeof CURATION_STATUSES)[number];
export type AssertionOrigin = (typeof ASSERTION_ORIGINS)[number];
export type ComparabilityStatus = (typeof COMPARABILITY_STATUSES)[number];

export interface PredicateDefinition {
  label: string;
  domains: readonly NodeType[];
  ranges: readonly NodeType[];
  evidenceRequired: boolean;
  causal: boolean;
  inverse?: string;
}

const ANY_RESEARCH: readonly NodeType[] = [
  "paper_work", "paper_version", "problem", "problem_framing", "claim", "method",
  "system", "component", "benchmark", "benchmark_use", "limitation",
  "limitation_occurrence", "research_thread", "comparison_assessment"
];

const VERSION_PART: readonly NodeType[] = [
  "source_document", "contribution", "problem_framing", "research_question",
  "claim", "method", "system", "component", "assumption", "conclusion",
  "future_work", "benchmark_use", "protocol", "experiment", "result_set",
  "ablation", "error_analysis", "reproduction_attempt", "limitation_occurrence",
  "threat_to_validity", "evidence"
];

export const PREDICATES = {
  part_of_version: { label: "part of version", domains: VERSION_PART, ranges: ["paper_version"], evidenceRequired: false, causal: false },
  addresses: { label: "addresses", domains: ANY_RESEARCH, ranges: ["problem", "problem_framing", "limitation", "limitation_occurrence"], evidenceRequired: true, causal: true },
  partially_addresses: { label: "partially addresses", domains: ANY_RESEARCH, ranges: ["problem", "problem_framing", "limitation", "limitation_occurrence"], evidenceRequired: true, causal: true },
  leaves_open: { label: "leaves open", domains: ANY_RESEARCH, ranges: ["problem", "problem_framing", "limitation", "limitation_occurrence"], evidenceRequired: true, causal: true },
  reframes: { label: "reframes", domains: ["problem_framing", "paper_version"], ranges: ["problem_framing", "problem"], evidenceRequired: true, causal: true },
  inherits_problem: { label: "inherits problem", domains: ["problem_framing", "paper_version"], ranges: ["problem", "problem_framing"], evidenceRequired: true, causal: false },
  introduces_problem: { label: "introduces problem", domains: ["paper_version", "problem_framing"], ranges: ["problem"], evidenceRequired: true, causal: false },
  reopens: { label: "reopens", domains: ANY_RESEARCH, ranges: ["problem", "limitation"], evidenceRequired: true, causal: true },
  uses_method: { label: "uses method", domains: ["paper_version", "system", "component"], ranges: ["method"], evidenceRequired: true, causal: false },
  extends_method: { label: "extends method", domains: ["method", "paper_version"], ranges: ["method"], evidenceRequired: true, causal: false },
  modifies_method: { label: "modifies method", domains: ["method", "paper_version"], ranges: ["method", "component"], evidenceRequired: true, causal: false },
  combines_with: { label: "combines with", domains: ["method", "component", "system"], ranges: ["method", "component", "system"], evidenceRequired: true, causal: false },
  replaces_component: { label: "replaces component", domains: ["paper_version", "method", "component"], ranges: ["component"], evidenceRequired: true, causal: false },
  removes_component: { label: "removes component", domains: ["paper_version", "method"], ranges: ["component"], evidenceRequired: true, causal: false },
  supports: { label: "supports", domains: ["claim", "paper_version", "result_set", "evidence"], ranges: ["claim"], evidenceRequired: true, causal: false },
  contradicts: { label: "contradicts", domains: ["claim", "paper_version"], ranges: ["claim"], evidenceRequired: true, causal: false },
  qualifies: { label: "qualifies", domains: ["claim", "paper_version"], ranges: ["claim"], evidenceRequired: true, causal: false },
  critiques: { label: "critiques", domains: ["paper_version", "claim"], ranges: ["paper_version", "claim", "method"], evidenceRequired: true, causal: false },
  provides_evidence_for: { label: "provides evidence for", domains: ["evidence", "result_set", "experiment"], ranges: ["claim", "relation"], evidenceRequired: false, causal: false },
  lacks_evidence_for: { label: "lacks evidence for", domains: ["paper_version", "claim"], ranges: ["claim"], evidenceRequired: true, causal: false },
  extends: { label: "extends", domains: ["paper_work", "paper_version"], ranges: ["paper_work", "paper_version"], evidenceRequired: true, causal: false },
  builds_on: { label: "builds on", domains: ["paper_work", "paper_version"], ranges: ["paper_work", "paper_version", "method"], evidenceRequired: true, causal: false },
  compares_against: { label: "compares against", domains: ["paper_version", "experiment", "benchmark_use"], ranges: ["paper_work", "paper_version", "baseline", "method"], evidenceRequired: true, causal: false },
  reproduces: { label: "reproduces", domains: ["paper_version", "reproduction_attempt"], ranges: ["paper_work", "paper_version", "claim"], evidenceRequired: true, causal: false },
  fails_to_reproduce: { label: "fails to reproduce", domains: ["paper_version", "reproduction_attempt"], ranges: ["paper_work", "paper_version", "claim"], evidenceRequired: true, causal: false },
  supersedes: { label: "supersedes", domains: ["paper_version", "paper_work"], ranges: ["paper_version", "paper_work"], evidenceRequired: true, causal: false },
  is_version_of: { label: "is version of", domains: ["paper_version"], ranges: ["paper_work"], evidenceRequired: false, causal: false },
  uses_benchmark: { label: "uses benchmark", domains: ["paper_version", "benchmark_use"], ranges: ["benchmark"], evidenceRequired: true, causal: false },
  evaluates_on: { label: "evaluates on", domains: ["paper_version", "experiment", "benchmark_use"], ranges: ["dataset", "task", "benchmark"], evidenceRequired: true, causal: false },
  reports_metric: { label: "reports metric", domains: ["paper_version", "benchmark_use", "result_set"], ranges: ["metric"], evidenceRequired: true, causal: false },
  uses_split: { label: "uses split", domains: ["benchmark_use", "experiment"], ranges: ["dataset", "benchmark"], evidenceRequired: true, causal: false },
  uses_protocol: { label: "uses protocol", domains: ["benchmark_use", "experiment"], ranges: ["protocol"], evidenceRequired: true, causal: false },
  reports_result: { label: "reports result", domains: ["paper_version", "benchmark_use", "experiment"], ranges: ["result_set"], evidenceRequired: true, causal: false },
  chronologically_after: { label: "chronologically after", domains: ANY_RESEARCH, ranges: ANY_RESEARCH, evidenceRequired: false, causal: false }
} as const satisfies Record<string, PredicateDefinition>;

export type Predicate = keyof typeof PREDICATES;
