import path from "node:path";
import { describe, expect, it } from "vitest";
import { auditVault, makeProposal, normalizeWikilink, parseFrontmatter, parseMarkdown, resultSetBlockSchema, sha256, validateVault } from "./index.js";

describe("PaperKG core", () => {
  it("parses a minimal paper work", () => {
    const parsed = parseFrontmatter({
      id: "pw_example", type: "paper_work", schema_version: "0.2.0",
      title: "Example", aliases: [], curation_status: "candidate",
      evidence_refs: [], tags: [], versions: [], topics: []
    });
    expect(parsed.id).toBe("pw_example");
  });

  it("normalizes wikilinks", () => {
    expect(normalizeWikilink("[[Example Note#^ev_1|label]]")).toBe("Example Note");
  });

  it("parses and validates structured result rows", () => {
    const note = parseMarkdown(`---\nid: rs_example\ntype: result_set\nschema_version: 0.2.0\ntitle: Example\npreferred_label: Example\naliases: []\nalt_labels: []\nbroader: []\nnarrower: []\nrelated: []\ndeprecated: false\ncuration_status: reviewed\nassertion_origin: author_stated\nevidence_status: table_derived\nevidence_refs: [\"[[ev_example]]\"]\ntags: []\npaper_version: \"[[pv_example]]\"\nstructured_rows: true\n---\n\n\`\`\`paperkg-resultset\nid: rs_example\nrows:\n  - benchmark_use: \"[[bu_example]]\"\n    system: Example\n    value: 1\n    unit: score\n    baseline: false\n    value_text: \"1\"\n    evidence_ref: \"[[ev_example]]\"\n\`\`\`\n`, "result.md", ".");
    expect(note.resultSetBlocks).toHaveLength(1);
    expect(resultSetBlockSchema.safeParse(note.resultSetBlocks[0]!.value).success).toBe(true);
  });

  it("rejects a non-exact pairwise assessment without difference fields", () => {
    expect(() => parseFrontmatter({
      id: "ca_example", type: "comparison_assessment", schema_version: "0.2.0", title: "Example",
      aliases: [], curation_status: "reviewed", evidence_refs: ["[[ev_example]]"], tags: [],
      benchmark: "[[bm_example]]", left_use: "[[bu_left]]", right_use: "[[bu_right]]",
      comparability_status: "partial", differing_fields: [], assessment_summary: "Different protocols",
      assertion_origin: "curator_interpreted"
    })).toThrow();
  });

  it("makes deterministic proposal content hashes", () => {
    const proposal = makeProposal({ createdBy: "codex", rationale: "test", operations: [{ op: "create", path: "01_Sources/PaperWorks/x.md", content: "x" }] });
    expect(proposal.contentHash).toHaveLength(64);
    expect(sha256("x")).toHaveLength(64);
  });

  it("validates the golden vault and rejects the invalid fixture", async () => {
    const valid = await validateVault(path.resolve("fixtures/valid-vault"));
    const invalid = await validateVault(path.resolve("fixtures/invalid-vault"));
    expect(valid.errors).toBe(0);
    expect(invalid.errors).toBeGreaterThan(0);
  });

  it("reports semantic completeness separately from schema validity", async () => {
    const report = await auditVault(path.resolve("fixtures/valid-vault"));
    expect(report.notes).toBeGreaterThan(0);
    expect(report.metrics.paper_works).toBe(1);
    expect(report.findings.some((finding) => finding.code === "evolution_relations_missing")).toBe(true);
  });
});
