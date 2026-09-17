import { z } from "zod";
import {
  ASSERTION_ORIGINS, COMPARABILITY_STATUSES, CONFIDENCE_LEVELS,
  CURATION_STATUSES, EVIDENCE_STATUSES, NODE_TYPES, PREDICATES,
  SCHEMA_VERSION
} from "./constants.js";

const link = z.string().regex(/^\[\[[^\]]+\]\]$/, "expected an Obsidian wikilink");
const linkOrId = z.string().min(2);
const nonEmptyLinkArray = z.array(link).min(1);
const date = z.preprocess(
  (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
);

export const externalIdsSchema = z.object({
  doi: z.string().min(3).optional(),
  arxiv: z.string().min(3).optional(),
  openreview: z.string().min(2).optional(),
  semantic_scholar: z.string().min(2).optional(),
  openalex: z.string().min(2).optional(),
  orcid: z.string().min(2).optional(),
  ror: z.string().min(2).optional()
}).catchall(z.string()).optional();

export const baseNoteSchema = z.object({
  id: z.string().regex(/^[a-z]{2}_[A-Za-z0-9][A-Za-z0-9_-]*$/),
  type: z.enum(NODE_TYPES),
  schema_version: z.literal(SCHEMA_VERSION),
  title: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  curation_status: z.enum(CURATION_STATUSES),
  assertion_origin: z.enum(ASSERTION_ORIGINS).optional(),
  evidence_status: z.enum(EVIDENCE_STATUSES).optional(),
  evidence_refs: z.array(z.string().min(3)).default([]),
  external_ids: externalIdsSchema,
  created_at: z.string().datetime({ offset: true }).optional(),
  updated_at: z.string().datetime({ offset: true }).optional(),
  tags: z.array(z.string()).default([])
}).catchall(z.unknown());

export const paperWorkSchema = baseNoteSchema.extend({
  type: z.literal("paper_work"),
  first_public_date: date.optional(),
  publication_year: z.number().int().min(1500).max(2200).optional(),
  citekey: z.string().optional(),
  canonical_version: link.optional(),
  versions: z.array(link).default([]),
  venue_event: link.optional(),
  topics: z.array(link).default([])
});

export const paperVersionSchema = baseNoteSchema.extend({
  type: z.literal("paper_version"),
  work: link,
  version_label: z.string().min(1),
  version_kind: z.enum(["arxiv", "venue", "journal", "workshop", "preprint", "other"]),
  version_number: z.string().min(1).optional(),
  released_at: date.optional(),
  submission_date: date.optional(),
  decision_date: date.optional(),
  venue_event_date: date.optional(),
  source_documents: z.array(link).default([])
});

export const sourceDocumentSchema = baseNoteSchema.extend({
  type: z.literal("source_document"),
  paper_version: link,
  source_path: z.string().min(1),
  media_type: z.string().min(3),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  parser: z.string().optional(),
  document_role: z.enum(["original", "translated", "bilingual_alternating", "parsed_text", "ocr"]),
  language: z.string().min(2).max(35),
  derived_from: link.optional(),
  translation_method: z.string().min(1).optional(),
  translation_version: z.string().min(1).optional()
}).refine((value) => value.document_role === "original" || Boolean(value.derived_from), {
  message: "Derived source documents require derived_from",
  path: ["derived_from"]
});

export const conceptSchema = baseNoteSchema.extend({
  preferred_label: z.string().min(1),
  preferred_label_ko: z.string().min(1).optional(),
  preferred_label_en: z.string().min(1).optional(),
  alt_labels: z.array(z.string()).default([]),
  broader: z.array(link).default([]),
  narrower: z.array(link).default([]),
  related: z.array(link).default([]),
  deprecated: z.boolean().default(false),
  replaced_by: link.optional()
});

export const contributionSchema = conceptSchema.extend({
  type: z.literal("contribution"),
  paper_version: link,
  contribution_kind: z.enum(["method", "system", "dataset", "benchmark", "empirical", "theoretical", "other"]).default("other")
});

export const claimSchema = conceptSchema.extend({
  type: z.literal("claim"),
  paper_version: link,
  claim_kind: z.enum(["empirical", "methodological", "conceptual", "theoretical", "other"]),
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  evidence_status: z.enum(EVIDENCE_STATUSES),
  evidence_refs: nonEmptyLinkArray
});

export const methodSchema = conceptSchema.extend({
  type: z.literal("method"),
  introduced_by: link.optional(),
  domain_profile: z.string().min(1).optional(),
  profile: z.record(z.string(), z.string()).default({})
});

export const protocolSchema = conceptSchema.extend({
  type: z.literal("protocol"),
  paper_version: link,
  model_set: z.array(z.string().min(1)).default([]),
  evaluator: z.string().min(1),
  prompt_setting: z.string().min(1),
  preprocessing: z.string().min(1),
  trial_count: z.union([z.number().int().positive(), z.literal("unknown")]),
  aggregation: z.string().min(1)
});

export const conclusionSchema = conceptSchema.extend({
  type: z.literal("conclusion"),
  paper_version: link,
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  evidence_refs: nonEmptyLinkArray
});

export const resultSetSchema = conceptSchema.extend({
  type: z.literal("result_set"),
  paper_version: link,
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  evidence_status: z.enum(EVIDENCE_STATUSES),
  evidence_refs: nonEmptyLinkArray,
  structured_rows: z.boolean()
});

export const baselineSchema = conceptSchema.extend({
  type: z.literal("baseline"),
  baseline_kind: z.enum(["no_memory", "prior_method", "ablation", "base_model", "human", "fixed_context", "other"]),
  description: z.string().min(1),
  paper_work: link.optional(),
  method: link.optional()
});

export const problemFramingSchema = baseNoteSchema.extend({
  type: z.literal("problem_framing"),
  paper_version: link,
  problem: link,
  framing_summary: z.string().min(1),
  claimed_cause: z.string().optional()
});

export const benchmarkSchema = conceptSchema.extend({
  type: z.literal("benchmark"),
  task: link,
  dataset: link,
  dataset_version: z.string().min(1),
  default_metrics: z.array(link).default([])
});

export const benchmarkUseSchema = baseNoteSchema.extend({
  type: z.literal("benchmark_use"),
  paper_version: link,
  benchmark: link,
  use_role: z.enum(["training", "validation", "primary_evaluation", "auxiliary_analysis", "ablation", "error_analysis", "other"]),
  purpose: z.string().min(1),
  dataset_version: z.string().min(1),
  splits: z.array(z.string().min(1)).min(1),
  protocols: z.array(link).min(1),
  metrics: z.array(link).min(1),
  baseline_set: z.array(link).default([]),
  result_sets: z.array(link).default([]),
  comparability_status: z.enum(COMPARABILITY_STATUSES),
  comparability_notes: z.string().min(1),
  configuration_fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  configuration_completeness: z.enum(["complete", "partial", "insufficient"])
});

export const comparisonAssessmentSchema = baseNoteSchema.extend({
  type: z.literal("comparison_assessment"),
  benchmark: link,
  left_use: link,
  right_use: link,
  comparability_status: z.enum(["exact", "partial", "not_comparable"]),
  differing_fields: z.array(z.string().min(1)),
  assessment_summary: z.string().min(1),
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  evidence_refs: nonEmptyLinkArray
}).refine((value) => value.comparability_status !== "exact" || value.differing_fields.length === 0, {
  message: "Exact comparisons cannot list differing_fields",
  path: ["differing_fields"]
}).refine((value) => value.comparability_status === "exact" || value.differing_fields.length > 0, {
  message: "Non-exact comparisons require differing_fields",
  path: ["differing_fields"]
});

export const limitationOccurrenceSchema = baseNoteSchema.extend({
  type: z.literal("limitation_occurrence"),
  paper_version: link,
  limitation: link,
  scope: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "unknown"]).default("unknown"),
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  evidence_status: z.enum(EVIDENCE_STATUSES)
});

export const evidenceSchema = baseNoteSchema.extend({
  type: z.literal("evidence"),
  source_version: link,
  source_kind: z.enum(["author_abstract", "author_body", "table", "figure", "appendix", "metadata", "review", "curator_note"]),
  location: z.string().min(1),
  summary: z.string().min(1),
  supports: z.array(linkOrId).default([]),
  evidence_status: z.enum(EVIDENCE_STATUSES)
});

export const relationSchema = baseNoteSchema.extend({
  type: z.literal("relation"),
  subject: link,
  predicate: z.enum(Object.keys(PREDICATES) as [keyof typeof PREDICATES, ...(keyof typeof PREDICATES)[]]),
  object: link,
  assertion_origin: z.enum(ASSERTION_ORIGINS),
  confidence: z.enum(CONFIDENCE_LEVELS),
  valid_from: date.optional(),
  valid_to: date.optional()
});

export const researchIdeaSchema = baseNoteSchema.extend({
  type: z.literal("research_idea"),
  idea_status: z.enum(["machine_suggested", "curator_reviewed", "accepted", "rejected"]),
  derived_from: z.array(link).min(1),
  reasoning_summary: z.string().min(1),
  meeting_record: link.optional(),
  source_segment_ids: z.array(z.string().min(1)).default([]),
  source_slide_ids: z.array(z.string().min(1)).default([]),
  source_paper_section_ids: z.array(z.string().min(1)).default([])
});

export const personSchema = conceptSchema.extend({
  type: z.literal("person"),
  display_name: z.string().min(1)
});

const meetingDerivedBase = conceptSchema.extend({
  meeting_record: link,
  source_segment_ids: z.array(z.string().min(1)).default([]),
  source_slide_ids: z.array(z.string().min(1)).default([]),
  source_paper_section_ids: z.array(z.string().min(1)).default([]),
  assertion_origin: z.enum(["participant_stated", "meeting_summary", "curator_interpreted", "machine_extracted"]),
  evidence_refs: nonEmptyLinkArray
});

export const decisionSchema = meetingDerivedBase.extend({
  type: z.literal("decision"),
  decision_text: z.string().min(1),
  decision_status: z.enum(["proposed", "accepted", "reversed", "superseded"])
});

export const actionItemSchema = meetingDerivedBase.extend({
  type: z.literal("action_item"),
  action_text: z.string().min(1),
  owner: z.string().min(1).optional(),
  due_at: date.optional(),
  action_status: z.enum(["proposed", "accepted", "in_progress", "done", "cancelled"])
});

export const openQuestionSchema = meetingDerivedBase.extend({
  type: z.literal("open_question"),
  question_text: z.string().min(1),
  question_status: z.enum(["open", "answered", "deferred"])
});

export const requirementSchema = meetingDerivedBase.extend({
  type: z.literal("requirement"),
  requirement_text: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "blocking"]),
  requirement_status: z.enum(["proposed", "accepted", "implemented", "rejected"])
});

export const riskSchema = meetingDerivedBase.extend({
  type: z.literal("risk"),
  risk_text: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical", "unknown"]),
  risk_status: z.enum(["open", "mitigated", "accepted", "closed"])
});

export const announcementSchema = meetingDerivedBase.extend({
  type: z.literal("announcement"),
  announcement_text: z.string().min(1),
  owner: z.string().min(1).optional(),
  due_at: date.optional(),
  announcement_status: z.enum(["announced", "acknowledged", "expired"])
});

export const memberUpdateSchema = meetingDerivedBase.extend({
  type: z.literal("member_update"),
  member: z.string().min(1),
  completed: z.array(z.string().min(1)).default([]),
  blockers: z.array(z.string().min(1)).default([]),
  next_steps: z.array(z.string().min(1)).default([]),
  feedback: z.array(z.string().min(1)).default([]),
  update_status: z.enum(["reported", "acknowledged", "superseded"])
});

export const questionAnswerSchema = meetingDerivedBase.extend({
  type: z.literal("question_answer"),
  question_text: z.string().min(1),
  answer_text: z.string().min(1).optional(),
  questioner: z.string().min(1).optional(),
  answerer: z.string().min(1).optional(),
  question_status: z.enum(["answered", "partial", "unresolved"])
});

export const presentedPaperSchema = meetingDerivedBase.extend({
  type: z.literal("presented_paper"),
  paper_title: z.string().min(1),
  paper_entity: link.optional(),
  identifiers: z.object({
    doi: z.string().min(1).optional(),
    arxiv_id: z.string().min(1).optional(),
    openreview_id: z.string().min(1).optional(),
    zotero_key: z.string().min(1).optional()
  }).default({}),
  presentation_summary: z.string().min(1).optional()
});

export const meetingRecordSchema = baseNoteSchema.extend({
  type: z.literal("meeting_record"),
  external_meeting_id: z.string().min(1),
  source_system: z.string().min(1),
  started_at: z.string().datetime({ offset: true }),
  ended_at: z.string().datetime({ offset: true }).optional(),
  language: z.string().min(2).default("ko"),
  participant_labels: z.array(z.string().min(1)).default([]),
  source_recording_uri: z.string().url().optional(),
  transcript_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  ingestion_receipt: z.string().min(3).optional(),
  assertion_origin: z.enum(["participant_stated", "meeting_summary"]),
  curation_status: z.enum(["inbox", "candidate", "reviewed", "verified", "disputed", "deprecated", "rejected"])
});

export const schemaByType = {
  paper_work: paperWorkSchema,
  paper_version: paperVersionSchema,
  source_document: sourceDocumentSchema,
  contribution: contributionSchema,
  claim: claimSchema,
  method: methodSchema,
  protocol: protocolSchema,
  conclusion: conclusionSchema,
  result_set: resultSetSchema,
  baseline: baselineSchema,
  problem_framing: problemFramingSchema,
  benchmark: benchmarkSchema,
  benchmark_use: benchmarkUseSchema,
  comparison_assessment: comparisonAssessmentSchema,
  limitation_occurrence: limitationOccurrenceSchema,
  relation: relationSchema,
  research_idea: researchIdeaSchema,
  evidence: evidenceSchema,
  meeting_record: meetingRecordSchema,
  person: personSchema,
  decision: decisionSchema,
  action_item: actionItemSchema,
  open_question: openQuestionSchema,
  requirement: requirementSchema,
  risk: riskSchema,
  announcement: announcementSchema,
  member_update: memberUpdateSchema,
  question_answer: questionAnswerSchema,
  presented_paper: presentedPaperSchema
} as const;

export const resultRowSchema = z.object({
  benchmark_use: link,
  system: z.string().min(1),
  metric: link.optional(),
  value: z.number().finite().optional(),
  unit: z.enum(["fraction", "percent", "points", "score", "count", "text"]).default("text"),
  dispersion: z.number().nonnegative().optional(),
  dispersion_kind: z.enum(["sd", "se", "ci", "range", "unknown"]).optional(),
  baseline: z.boolean().default(false),
  value_text: z.string().min(1),
  evidence_ref: link
});

export const resultSetBlockSchema = z.object({
  id: z.string().regex(/^rs_[A-Za-z0-9][A-Za-z0-9_-]*$/),
  rows: z.array(resultRowSchema).min(1)
});

export type NoteFrontmatter = z.infer<typeof baseNoteSchema>;

export function parseFrontmatter(input: unknown): NoteFrontmatter {
  const base = baseNoteSchema.parse(input);
  const specialized = schemaByType[base.type as keyof typeof schemaByType];
  return specialized ? specialized.parse(input) : conceptSchema.parse(input);
}

export { link };
