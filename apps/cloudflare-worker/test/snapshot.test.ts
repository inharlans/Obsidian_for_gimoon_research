import { describe, expect, it } from "vitest";
import { publicNote, search } from "../src/snapshot.js";
import type { PaperKgSnapshot, SnapshotNote } from "../src/types.js";

describe("snapshot evidence search boundary", () => {
  it("searches full evidence text only for evidence-scoped callers", () => {
    const note: SnapshotNote = {
      id: "ev_test",
      type: "evidence",
      title: "Method evidence",
      aliases: [],
      metadata: {},
      body: "secret-evidence-phrase",
      summary: "Evidence available with paperkg.evidence.read",
      searchText: "ev_test method evidence evidence available with paperkg.evidence.read",
    };
    const snapshot: PaperKgSnapshot = {
      schemaVersion: "1.0",
      generatedAt: "2026-08-12T00:00:00Z",
      sourceRevision: "test",
      noteCount: 1,
      notes: [note],
      edges: [],
      aliases: {},
    };

    expect(search(snapshot, "secret-evidence-phrase", 10)).toEqual([]);
    expect(search(snapshot, "secret-evidence-phrase", 10, undefined, true)).toEqual([note]);
  });

  it("does not expose evidence summaries, locations, or support targets through metadata", () => {
    const note: SnapshotNote = {
      id: "ev_test",
      type: "evidence",
      title: "Method evidence",
      aliases: [],
      metadata: {
        id: "ev_test",
        type: "evidence",
        title: "Method evidence",
        curation_status: "reviewed",
        summary: "sensitive evidence summary",
        location: "page 7",
        supports: ["cl_test"],
      },
      body: "full sensitive evidence",
      summary: "redacted summary",
      searchText: "ev_test method evidence redacted summary",
    };

    const restricted = publicNote(note, "https://paperkg.example", false);
    expect(restricted.text).toBe("Evidence content requires paperkg.evidence.read.");
    expect(restricted.metadata).toEqual({
      id: "ev_test",
      type: "evidence",
      title: "Method evidence",
      curation_status: "reviewed",
    });

    const allowed = publicNote(note, "https://paperkg.example", true);
    expect(allowed.text).toBe("full sensitive evidence");
    expect(allowed.metadata).toMatchObject({ summary: "sensitive evidence summary", location: "page 7" });
  });
});
