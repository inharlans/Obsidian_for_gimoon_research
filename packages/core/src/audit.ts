import path from "node:path";
import { normalizeWikilink, scanVault, type VaultNote } from "./markdown.js";
import { resultSetBlockSchema } from "./schema.js";

export type AuditPriority = "high" | "medium" | "low";

export interface AuditFinding {
  priority: AuditPriority;
  code: string;
  message: string;
  note_ids: string[];
}

export interface AuditReport {
  vault: string;
  notes: number;
  metrics: Record<string, number>;
  findings: AuditFinding[];
}

function idOfLink(value: unknown): string | undefined {
  return typeof value === "string" ? normalizeWikilink(value) : undefined;
}

function ids(notes: VaultNote[]): string[] {
  return notes.map((note) => note.data?.id).filter((id): id is string => Boolean(id));
}

function add(findings: AuditFinding[], priority: AuditPriority, code: string, message: string, notes: VaultNote[] = []): void {
  findings.push({ priority, code, message, note_ids: ids(notes) });
}

export async function auditVault(vaultRoot: string): Promise<AuditReport> {
  const notes = (await scanVault(vaultRoot)).filter((note) => note.data);
  const findings: AuditFinding[] = [];
  const byType = new Map<string, VaultNote[]>();
  for (const note of notes) {
    const type = String(note.data!.type);
    byType.set(type, [...(byType.get(type) ?? []), note]);
  }
  const ofType = (type: string): VaultNote[] => byType.get(type) ?? [];

  const benchmarkUses = ofType("benchmark_use");
  const emptyBaselines = benchmarkUses.filter((note) => !Array.isArray(note.frontmatter.baseline_set) || note.frontmatter.baseline_set.length === 0);
  if (emptyBaselines.length > 0) add(findings, "high", "benchmark_baselines_missing", `${emptyBaselines.length} benchmark uses have no baseline_set`, emptyBaselines);

  const insufficientConfigurations = benchmarkUses.filter((note) => note.frontmatter.configuration_completeness === "insufficient");
  if (insufficientConfigurations.length > 0) add(findings, "medium", "configuration_insufficient", `${insufficientConfigurations.length} evaluation configurations remain insufficiently specified`, insufficientConfigurations);

  let resultRows = 0;
  const unstructuredResults: VaultNote[] = [];
  for (const note of ofType("result_set")) {
    let rows = 0;
    for (const block of note.resultSetBlocks) {
      const parsed = resultSetBlockSchema.safeParse(block.value);
      if (parsed.success) rows += parsed.data.rows.length;
    }
    resultRows += rows;
    if (rows === 0) unstructuredResults.push(note);
  }
  if (unstructuredResults.length > 0) add(findings, "high", "result_rows_missing", `${unstructuredResults.length} result sets have no validated structured rows`, unstructuredResults);

  const reusableTypes = new Set(["problem", "method", "limitation", "benchmark", "dataset", "task", "metric", "protocol", "research_thread"]);
  const vocabulary = notes.filter((note) => reusableTypes.has(String(note.data!.type)));
  const withoutAliases = vocabulary.filter((note) => !Array.isArray(note.data!.aliases) || note.data!.aliases.length === 0);
  if (withoutAliases.length > 0) add(findings, "medium", "vocabulary_alias_missing", `${withoutAliases.length} reusable vocabulary notes have no aliases`, withoutAliases);

  const evolutionPredicates = new Set(["addresses", "partially_addresses", "reframes", "reopens", "contradicts", "qualifies", "builds_on", "extends_method"]);
  const evolutionRelations = ofType("relation").filter((note) => evolutionPredicates.has(String(note.frontmatter.predicate)));
  if (evolutionRelations.length === 0) add(findings, "high", "evolution_relations_missing", "No evidence-backed problem or limitation evolution relations exist");

  const usesByBenchmark = new Map<string, string[]>();
  for (const note of benchmarkUses) {
    const benchmark = idOfLink(note.frontmatter.benchmark);
    if (benchmark) usesByBenchmark.set(benchmark, [...(usesByBenchmark.get(benchmark) ?? []), note.data!.id]);
  }
  const assessedPairs = new Set<string>();
  for (const note of ofType("comparison_assessment")) {
    const left = idOfLink(note.frontmatter.left_use);
    const right = idOfLink(note.frontmatter.right_use);
    if (left && right) assessedPairs.add([left, right].sort().join("\u0000"));
  }
  let expectedComparisonPairs = 0;
  const missingComparisonPairs: string[] = [];
  for (const [benchmark, uses] of usesByBenchmark) {
    if (uses.length < 2) continue;
    for (let left = 0; left < uses.length; left += 1) {
      for (let right = left + 1; right < uses.length; right += 1) {
        expectedComparisonPairs += 1;
        const key = [uses[left]!, uses[right]!].sort().join("\u0000");
        if (!assessedPairs.has(key)) missingComparisonPairs.push(`${benchmark}:${uses[left]}:${uses[right]}`);
      }
    }
  }
  if (missingComparisonPairs.length > 0) {
    add(findings, "high", "comparison_assessment_missing", `${missingComparisonPairs.length} shared-benchmark pairs lack a pairwise assessment`);
  }

  const sourceDocuments = ofType("source_document");
  const sourceWithoutRole = sourceDocuments.filter((note) => !note.frontmatter.document_role || !note.frontmatter.language);
  if (sourceWithoutRole.length > 0) add(findings, "high", "source_provenance_missing", `${sourceWithoutRole.length} source documents lack role or language provenance`, sourceWithoutRole);

  const works = ofType("paper_work");
  const versions = ofType("paper_version");
  const multiVersionWorks = works.filter((work) => Array.isArray(work.frontmatter.versions) && work.frontmatter.versions.length > 1).length;
  const verifiedNotes = notes.filter((note) => note.data!.curation_status === "verified").length;

  return {
    vault: path.resolve(vaultRoot),
    notes: notes.length,
    metrics: {
      paper_works: works.length,
      paper_versions: versions.length,
      multi_version_works: multiVersionWorks,
      benchmark_uses: benchmarkUses.length,
      baselines: ofType("baseline").length,
      result_rows: resultRows,
      comparison_assessments: ofType("comparison_assessment").length,
      expected_shared_benchmark_pairs: expectedComparisonPairs,
      evolution_relations: evolutionRelations.length,
      evidence_notes: ofType("evidence").length,
      reusable_vocabulary_notes: vocabulary.length,
      vocabulary_with_aliases: vocabulary.length - withoutAliases.length,
      vocabulary_with_semantic_links: vocabulary.filter((note) => ["broader", "narrower", "related"].some((key) => Array.isArray(note.frontmatter[key]) && note.frontmatter[key].length > 0)).length,
      reviewed_notes: notes.filter((note) => note.data!.curation_status === "reviewed").length,
      verified_notes: verifiedNotes
    },
    findings
  };
}
