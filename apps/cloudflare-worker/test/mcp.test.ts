import { describe, expect, it } from "vitest";
import { boundedItems, resolveDistinctPaperWorks } from "../src/mcp.js";
import type { PaperKgSnapshot, SnapshotNote } from "../src/types.js";

function paper(id: string, title: string, aliases: string[] = []): SnapshotNote {
  return { id, type: "paper_work", title, aliases, metadata: {}, body: "", summary: "", searchText: title.toLowerCase() };
}

const papers = [paper("pw_a", "Paper A", ["A"]), paper("pw_b", "Paper B", ["B"])];
const snapshot: PaperKgSnapshot = {
  schemaVersion: "1.0",
  generatedAt: "2026-08-12T00:00:00Z",
  sourceRevision: "test",
  noteCount: papers.length,
  notes: papers,
  edges: [],
  aliases: { a: ["pw_a"], b: ["pw_b"] },
};

describe("hosted MCP result integrity", () => {
  it("rejects unknown or duplicate paper comparisons instead of silently dropping inputs", () => {
    expect(() => resolveDistinctPaperWorks(snapshot, ["A", "missing"])).toThrow("Unknown paper work(s): missing");
    expect(() => resolveDistinctPaperWorks(snapshot, ["A", "pw_a"])).toThrow("distinct paper works");
    expect(resolveDistinctPaperWorks(snapshot, ["A", "B"]).map((item) => item.id)).toEqual(["pw_a", "pw_b"]);
  });

  it("marks truncation only when undisclosed items actually remain", () => {
    expect(boundedItems([1, 2], 2)).toEqual({ items: [1, 2], truncated: false });
    expect(boundedItems([1, 2, 3], 2)).toEqual({ items: [1, 2], truncated: true });
  });
});
