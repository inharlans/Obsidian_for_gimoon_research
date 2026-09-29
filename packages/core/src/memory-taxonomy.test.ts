import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
import { parseFrontmatter, scanVault, validateVault } from "./index.js";

const method = (id: string, profile: Record<string, unknown> = {}) => ({
  id, type: "method", schema_version: "0.2.0", title: id,
  preferred_label: id, curation_status: "reviewed", profile
});
const relation = (overrides: Record<string, unknown> = {}) => ({
  id: "re_shared", type: "relation", schema_version: "0.2.0", title: "Shared design",
  curation_status: "candidate", assertion_origin: "curator_interpreted", confidence: "medium",
  subject: "[[me_left]]", object: "[[me_right]]", predicate: "shares_design_facet",
  shared_facet: "memory_target_category=design_space", evidence_refs: [], ...overrides
});

async function fixture(notes: Record<string, unknown>[], run: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), "paperkg-facets-"));
  try {
    for (const note of notes) await writeFile(path.join(root, `${note.id}.md`), `---\n${YAML.stringify(note)}---\n`);
    await run(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}

describe("memory taxonomy compatibility", () => {
  it("preserves legacy free-text profiles and multi-valued memory targets", () => {
    expect(parseFrontmatter(method("me_legacy", { online_or_offline: "online test-time" })).id).toBe("me_legacy");
    const profile = {
      agent_scope: "single_agent_memory", design_origin: "hand_crafted",
      memory_target_category: ["experience_trajectory", "strategy_policy"], memory_unit: "episodes"
    };
    expect(parseFrontmatter(method("me_multi", profile)).profile).toEqual(profile);
  });

  it.each([
    { agent_scope: "single-agent" }, { design_origin: "invented" },
    { memory_target_category: "design_space" }, { memory_target_category: [] },
    { memory_target_category: ["invented"] }, { unrelated_field: ["array"] }
  ])("rejects an invalid profile %j", (profile) => {
    expect(() => parseFrontmatter(method("me_bad", profile))).toThrow();
  });

  it.each([
    { shared_facet: undefined }, { shared_facet: "unknown=value" },
    { shared_facet: "agent_scope=design_space" },
    { shared_facet: "memory_target_category=design_space=extra" },
    { assertion_origin: "author_stated" }
  ])("rejects invalid facet-relation semantics %j", (overrides) => {
    expect(() => parseFrontmatter(relation(overrides))).toThrow();
  });

  it("checks actual membership on both endpoints without promoting candidates", async () => {
    await fixture([
      method("me_left", { memory_target_category: ["design_space", "strategy_policy"] }),
      method("me_right", { memory_target_category: ["design_space"] }), relation()
    ], async (root) => {
      expect((await validateVault(root)).errors).toBe(0);
      expect((await scanVault(root)).find(n => n.data?.id === "re_shared")?.data?.curation_status).toBe("candidate");
      await writeFile(path.join(root, "me_right.md"), `---\n${YAML.stringify(method("me_right", { memory_target_category: ["strategy_policy"] }))}---\n`);
      expect((await validateVault(root)).issues.some(i => i.code === "shared_facet_mismatch")).toBe(true);
    });
  });

  it("accepts scalar overlap and rejects non-method endpoints", async () => {
    await fixture([
      method("me_left", { agent_scope: "single_agent_memory" }),
      method("me_right", { agent_scope: "single_agent_memory" }),
      relation({ shared_facet: "agent_scope=single_agent_memory" })
    ], async (root) => {
      expect((await validateVault(root)).errors).toBe(0);
      await writeFile(path.join(root, "me_right.md"), `---\n${YAML.stringify({ ...method("me_right"), type: "problem" })}---\n`);
      expect((await validateVault(root)).issues.some(i => i.code === "predicate_range")).toBe(true);
    });
  });

  it("ignores instruction files, but still reports malformed knowledge notes", async () => {
    await fixture([method("me_valid")], async (root) => {
      await mkdir(path.join(root, "nested"));
      await writeFile(path.join(root, "AGENTS.md"), "# Instructions\n");
      await writeFile(path.join(root, "nested/AGENTS.md"), "# Instructions\n");
      expect((await validateVault(root)).errors).toBe(0);
      await writeFile(path.join(root, "broken.md"), "# Missing frontmatter\n");
      expect((await validateVault(root)).issues.some(i => i.file === "broken.md" && i.code === "schema")).toBe(true);
    });
  });

});
