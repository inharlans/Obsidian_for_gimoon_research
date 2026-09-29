import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyProposal, approveProposal, makeProposal, sha256, validateProposal, type Proposal } from "./proposals.js";

const roots: string[] = [];
async function vault() {
  const root = await mkdtemp(path.join(tmpdir(), "paperkg-apply-test-"));
  roots.push(root);
  return root;
}
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }); });
const note = (id: string, extra = "") => `---\nid: ${id}\ntype: paper_work\nschema_version: 0.2.0\ntitle: ${id}\ncuration_status: candidate\n---\n${extra}\n`;
const proposal = (operations: Proposal["operations"]) => makeProposal({ createdBy: "codex", rationale: "Fixture proposal", operations });

describe("proposal application guards", () => {
  it("detects changed content even when the stored hash is unchanged", async () => {
    const root = await vault();
    const p = proposal([{ op: "create", path: "pw_a.md", content: note("pw_a") }]);
    const token = await approveProposal(root, p);
    p.operations[0]!.content = note("pw_tampered");
    await expect(applyProposal(root, p, token)).rejects.toThrow("hash mismatch");
    await expect(approveProposal(root, p)).rejects.toThrow("hash mismatch");
    expect(await readdir(root)).toEqual([".paperkg"]);
  });

  it("does not overwrite an existing create target or apply earlier operations", async () => {
    const root = await vault();
    await writeFile(path.join(root, "pw_existing.md"), note("pw_existing"));
    const p = proposal([
      { op: "create", path: "pw_first.md", content: note("pw_first") },
      { op: "create", path: "pw_existing.md", content: note("pw_replacement") }
    ]);
    const token = await approveProposal(root, p);
    await expect(applyProposal(root, p, token)).rejects.toThrow("already exists");
    expect(await readFile(path.join(root, "pw_existing.md"), "utf8")).toBe(note("pw_existing"));
    expect(await readdir(root)).not.toContain("pw_first.md");
  });

  it("requires a matching base revision before any update", async () => {
    const root = await vault();
    await writeFile(path.join(root, "pw_a.md"), note("pw_a"));
    for (const operation of [
      { op: "update" as const, path: "pw_a.md", content: note("pw_changed") },
      { op: "update" as const, path: "pw_a.md", content: note("pw_changed"), baseSha256: "0".repeat(64) }
    ]) {
      const p = proposal([operation]);
      await expect(applyProposal(root, p, await approveProposal(root, p))).rejects.toThrow(/baseSha256|Base revision/);
    }
    expect(await readFile(path.join(root, "pw_a.md"), "utf8")).toBe(note("pw_a"));
  });

  it("previews cross-note links without modifying the canonical vault", async () => {
    const root = await vault();
    const p = proposal([
      { op: "create", path: "pw_a.md", content: note("pw_a", "[[pw_b]]") },
      { op: "create", path: "pw_b.md", content: note("pw_b") }
    ]);
    expect((await validateProposal(root, p)).errors).toBe(0);
    expect(await readdir(root)).toEqual([]);
  });

  it("refuses a dangling link before writing any proposal file", async () => {
    const root = await vault();
    const p = proposal([{ op: "create", path: "pw_a.md", content: note("pw_a", "[[pw_missing]]") }]);
    await expect(applyProposal(root, p, await approveProposal(root, p))).rejects.toThrow("Proposal validation failed");
    expect(await readdir(root)).toEqual([".paperkg"]);
  });

  it("supports the plugin's approved status and consumes the token once", async () => {
    const root = await vault();
    const p = proposal([{ op: "create", path: "pw_a.md", content: note("pw_a") }]);
    const token = await approveProposal(root, p);
    p.status = "approved";
    await applyProposal(root, p, token);
    expect(await readFile(path.join(root, "pw_a.md"), "utf8")).toBe(note("pw_a"));
    await expect(applyProposal(root, p, token)).rejects.toThrow();
  });

  it("applies a revision-checked update", async () => {
    const root = await vault();
    const original = note("pw_a");
    await writeFile(path.join(root, "pw_a.md"), original);
    const updated = note("pw_a", "Updated");
    const p = proposal([{ op: "update", path: "pw_a.md", content: updated, baseSha256: sha256(original) }]);
    await applyProposal(root, p, await approveProposal(root, p));
    expect(await readFile(path.join(root, "pw_a.md"), "utf8")).toBe(updated);
  });

  it("rejects duplicate target paths, including case aliases", async () => {
    const root = await vault();
    const p = proposal([
      { op: "create", path: "pw_a.md", content: note("pw_a") },
      { op: "create", path: "PW_A.md", content: note("pw_b") }
    ]);
    await expect(validateProposal(root, p)).rejects.toThrow("Duplicate proposal path");
  });

  it.each(["../outside.md", "C:/outside.md", "folder\\outside.md"])("rejects an unsafe path %s", async (target) => {
    const root = await vault();
    const p = proposal([{ op: "create", path: target, content: note("pw_a") }]);
    await expect(validateProposal(root, p)).rejects.toThrow("Unsafe proposal path");
  });

  it.each(["AGENTS.md", "10_Inbox/unvalidated.md"])("rejects a path excluded from knowledge validation: %s", async (target) => {
    const root = await vault();
    const p = proposal([{ op: "create", path: target, content: note("pw_a") }]);
    await expect(validateProposal(root, p)).rejects.toThrow("outside validated knowledge");
  });

  it("rejects an invalid expiry without writing notes", async () => {
    const root = await vault();
    const p = proposal([{ op: "create", path: "pw_a.md", content: note("pw_a") }]);
    const token = await approveProposal(root, p);
    const file = path.join(root, ".paperkg/approvals", `${p.id}.json`);
    const record = JSON.parse(await readFile(file, "utf8"));
    record.expiresAt = "invalid";
    await writeFile(file, JSON.stringify(record));
    await expect(applyProposal(root, p, token)).rejects.toThrow("expired");
    expect(await readdir(root)).toEqual([".paperkg"]);
  });

  it("allows only one concurrent use of an approval token", async () => {
    const root = await vault();
    const p = proposal([{ op: "create", path: "pw_a.md", content: note("pw_a") }]);
    const token = await approveProposal(root, p);
    const results = await Promise.allSettled([applyProposal(root, p, token), applyProposal(root, p, token)]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect(await readFile(path.join(root, "pw_a.md"), "utf8")).toBe(note("pw_a"));
  });
});
