import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("Cloudflare snapshot publisher", () => {
  it("keeps public identifiers while removing nested local and credential metadata", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "paperkg-snapshot-"));
    const vault = path.join(root, "vault");
    const output = path.join(root, "snapshot.json");
    await mkdir(vault, { recursive: true });
    await writeFile(path.join(vault, "paper.md"), `---
id: pw_private_test
type: paper_work
title: Private metadata test
curation_status: reviewed
external_ids:
  doi: 10.1000/public
  zotero_item: SECRET_ITEM
  zotero_attachment: SECRET_ATTACHMENT
source_path: C:/private/paper.pdf
service_token: SECRET_TOKEN
---

# Public summary

> [!evidence] ev_private
> source_kind: author_body
> summary: SECRET_EVIDENCE_TEXT

Public conclusion.
`, "utf8");

    await execFileAsync(process.execPath, [
      path.resolve("scripts/build-cloudflare-snapshot.mjs"),
      vault,
      output,
    ], { cwd: path.resolve(".") });

    const snapshot = JSON.parse(await readFile(output, "utf8")) as {
      notes: Array<{ metadata: Record<string, unknown>; summary: string; searchText: string }>;
    };
    const note = snapshot.notes[0]!;
    expect(note.metadata).toMatchObject({ external_ids: { doi: "10.1000/public" } });
    expect(JSON.stringify(note.metadata)).not.toContain("SECRET_");
    expect(note.summary).not.toContain("SECRET_EVIDENCE_TEXT");
    expect(note.summary).toContain("Evidence available with paperkg.evidence.read");
    expect(note.searchText).not.toContain("secret_evidence_text");
  });
});
