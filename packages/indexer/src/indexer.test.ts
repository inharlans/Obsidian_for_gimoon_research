import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PaperKgIndex, rebuildIndex } from "./index.js";

describe("SQLite index", () => {
  it("rebuilds and searches a vault", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "paperkg-index-"));
    await mkdir(path.join(root, "01_Sources"));
    await writeFile(path.join(root, "01_Sources", "paper.md"), `---\nid: pw_test\ntype: paper_work\nschema_version: 0.2.0\ntitle: Test Memory Paper\naliases: [TMP]\ncuration_status: reviewed\nevidence_refs: []\ntags: []\nversions: []\ntopics: []\n---\n# Test Memory Paper\n\nAdaptive memory retrieval.\n`);
    const result = await rebuildIndex(root);
    expect(result.notes).toBe(1);
    expect(result.embeddings).toBe(1);
    const index = new PaperKgIndex(result.databasePath);
    expect(index.search("adaptive")[0]?.id).toBe("pw_test");
    expect(index.semantic("memory retrieval")[0]?.id).toBe("pw_test");
    expect(index.exact("TMP")[0]?.id).toBe("pw_test");
    index.close();
  });
});
