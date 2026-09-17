import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  applyProposal,
  approveProposal,
  importMeetingCandidateBundle,
  loadProposal,
  meetingEnvelopeSchema,
  setProposalStatus,
  validateVault,
} from "./index.js";

const temporaryRoots: string[] = [];

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function fixtureEnvelope() {
  const raw = JSON.parse(await readFile(path.resolve("fixtures/meeting-ingestion/seminar-app-v1.1.json"), "utf8")) as unknown;
  return meetingEnvelopeSchema.parse(raw);
}

async function temporaryVault(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "paperkg-meeting-sync-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("meeting ingestion v1.1", () => {
  it("preserves rich meeting types and keeps canonical notes unchanged before approval", async () => {
    const vaultRoot = await temporaryVault();
    const envelope = await fixtureEnvelope();
    const contentSha = createHash("sha256").update(stableJson(envelope)).digest("hex");
    const bundle = {
      receipt: {
        receipt_id: "mi_11111111111111111111111111111111",
        note_id: "mtg_222222222222222222222222",
        note_path: "10_Inbox/Meetings/Remote/mtg_222222222222222222222222.md",
        content_sha256: contentSha,
        subject_sha256: "3".repeat(64),
        status: "candidate",
        submitted_at: "2026-05-22T06:30:00.000Z",
        replayed: false,
      },
      envelope,
    };

    const first = await importMeetingCandidateBundle({ vaultRoot, bundle });
    const second = await importMeetingCandidateBundle({ vaultRoot, bundle });
    expect(first.status).toBe("needs_review");
    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(await readdir(path.join(vaultRoot, "10_Inbox", "Meetings", "Remote"))).toEqual(["mtg_222222222222222222222222.md"]);

    const proposal = await loadProposal(vaultRoot, first.proposalId);
    expect(proposal.operations).toHaveLength(9);
    expect(proposal.operations.map((operation) => operation.path)).toEqual(expect.arrayContaining([
      expect.stringContaining("Announcements"),
      expect.stringContaining("MemberUpdates"),
      expect.stringContaining("QuestionsAndAnswers"),
      expect.stringContaining("08_Ideas"),
      expect.stringContaining("PresentedPapers"),
    ]));
    expect(await readdir(vaultRoot)).toEqual(expect.arrayContaining([".paperkg", "10_Inbox"]));
    expect((await readdir(vaultRoot)).some((name) => /^0[1-9]_/.test(name))).toBe(false);

    const token = await approveProposal(vaultRoot, proposal);
    await applyProposal(vaultRoot, proposal, token);
    await setProposalStatus(vaultRoot, proposal.id, "applied");
    const promoted = await importMeetingCandidateBundle({ vaultRoot, bundle });
    expect(promoted.status).toBe("promoted");
    expect(promoted.replayed).toBe(true);
    const validation = await validateVault(vaultRoot);
    expect(validation.errors, validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n")).toBe(0);
    expect(validation.notes).toBe(9);
  });

  it("rejects transcript references that are not included in the envelope", async () => {
    const envelope = JSON.parse(JSON.stringify(await fixtureEnvelope())) as Record<string, unknown>;
    const announcements = envelope.announcements as Array<Record<string, unknown>>;
    announcements[0]!.transcript_segment_ids = ["not-in-transcript"];
    const result = meetingEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message.includes("unknown transcript segment id"))).toBe(true);
  });

  it("rejects a bundle whose receipt hash does not cover the normalized envelope", async () => {
    const vaultRoot = await temporaryVault();
    const envelope = await fixtureEnvelope();
    await expect(importMeetingCandidateBundle({
      vaultRoot,
      bundle: {
        receipt: {
          receipt_id: "mi_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          note_id: "mtg_bbbbbbbbbbbbbbbbbbbbbbbb",
          note_path: "10_Inbox/Meetings/Remote/mtg_bbbbbbbbbbbbbbbbbbbbbbbb.md",
          content_sha256: "c".repeat(64),
          subject_sha256: "d".repeat(64),
          status: "candidate",
          submitted_at: "2026-05-22T06:30:00.000Z",
          replayed: false,
        },
        envelope,
      },
    })).rejects.toThrow("does not match receipt");
  });
});
