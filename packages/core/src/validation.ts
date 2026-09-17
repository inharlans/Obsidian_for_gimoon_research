import path from "node:path";
import { PREDICATES, SCHEMA_VERSION, type NodeType, type PredicateDefinition } from "./constants.js";
import { normalizeWikilink, scanVault, type VaultNote } from "./markdown.js";
import { parseFrontmatter, resultSetBlockSchema } from "./schema.js";

export type Severity = "error" | "warning";

export interface ValidationIssue {
  severity: Severity;
  code: string;
  file: string;
  message: string;
}

export interface ValidationReport {
  vault: string;
  notes: number;
  errors: number;
  warnings: number;
  issues: ValidationIssue[];
}

function add(issues: ValidationIssue[], severity: Severity, code: string, note: VaultNote, message: string): void {
  issues.push({ severity, code, file: note.relativePath, message });
}

export async function validateVault(vaultRoot: string): Promise<ValidationReport> {
  const notes = await scanVault(vaultRoot);
  const issues: ValidationIssue[] = [];
  const byId = new Map<string, VaultNote>();
  const resolver = new Map<string, VaultNote>();

  for (const note of notes) {
    if (note.parseError) {
      add(issues, "error", "markdown_parse", note, note.parseError);
      continue;
    }
    try {
      note.data = parseFrontmatter(note.frontmatter);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      add(issues, "error", "schema", note, message);
      continue;
    }
    const existing = byId.get(note.data.id);
    if (existing) {
      add(issues, "error", "duplicate_id", note, `ID ${note.data.id} already exists in ${existing.relativePath}`);
    } else {
      byId.set(note.data.id, note);
    }
    const keys = [note.data.id, note.basename, note.data.title, ...(note.data.aliases ?? [])];
    for (const key of keys) resolver.set(key.toLocaleLowerCase(), note);
    if (note.data.schema_version !== SCHEMA_VERSION) {
      add(issues, "error", "schema_version", note, `Expected schema ${SCHEMA_VERSION}`);
    }
  }

  for (const note of notes) {
    if (!note.data) continue;
    for (const rawLink of note.wikilinks) {
      const target = normalizeWikilink(`[[${rawLink}]]`).toLocaleLowerCase();
      if (!resolver.has(target)) add(issues, "error", "dangling_wikilink", note, `Unresolved wikilink [[${rawLink}]]`);
    }
    if (note.data.type === "relation") {
      const fm = note.frontmatter;
      const predicate = String(fm.predicate ?? "") as keyof typeof PREDICATES;
      const definition = PREDICATES[predicate] as PredicateDefinition | undefined;
      const subject = resolver.get(normalizeWikilink(String(fm.subject ?? "")).toLocaleLowerCase());
      const object = resolver.get(normalizeWikilink(String(fm.object ?? "")).toLocaleLowerCase());
      if (definition && subject?.data && !definition.domains.includes(subject.data.type as NodeType)) {
        add(issues, "error", "predicate_domain", note, `${predicate} does not accept ${subject.data.type} as subject`);
      }
      if (definition && object?.data && !definition.ranges.includes(object.data.type as NodeType)) {
        add(issues, "error", "predicate_range", note, `${predicate} does not accept ${object.data.type} as object`);
      }
      if (definition?.evidenceRequired && (note.data.evidence_refs?.length ?? 0) === 0) {
        add(issues, "error", "relation_missing_evidence", note, `${predicate} requires evidence_refs`);
      }
    }
    if (note.data.type === "benchmark_use" && note.frontmatter.comparability_status === "exact") {
      const notesText = String(note.frontmatter.comparability_notes ?? "");
      if (notesText.length < 20) add(issues, "warning", "exact_comparability_weak", note, "Exact comparability should explain protocol identity");
    }
    if (note.data.type === "result_set") {
      if (note.frontmatter.structured_rows !== true) {
        add(issues, "error", "result_set_unstructured", note, "Result sets must declare structured_rows: true");
      }
      if (note.resultSetBlocks.length === 0) {
        add(issues, "error", "result_set_missing_block", note, "Expected a paperkg-resultset block");
      }
      for (const block of note.resultSetBlocks) {
        if (block.error) {
          add(issues, "error", "result_set_block_yaml", note, block.error);
          continue;
        }
        const parsed = resultSetBlockSchema.safeParse(block.value);
        if (!parsed.success) {
          add(issues, "error", "result_set_block_schema", note, parsed.error.message);
        } else if (parsed.data.id !== note.data.id) {
          add(issues, "error", "result_set_block_id", note, `Block ID ${parsed.data.id} does not match ${note.data.id}`);
        }
      }
    }
    if (note.data.type === "limitation_occurrence" && !note.frontmatter.assertion_origin) {
      add(issues, "error", "limitation_missing_provenance", note, "Limitation occurrence requires assertion_origin");
    }
  }

  return {
    vault: path.resolve(vaultRoot),
    notes: notes.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    issues
  };
}
