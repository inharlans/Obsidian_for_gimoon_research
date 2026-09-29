import { createHash } from "node:crypto";
import type { Proposal } from "./proposals.js";

export function proposalPayload(value: Omit<Proposal, "contentHash">): string {
  return JSON.stringify({ ...value, operations: [...value.operations].sort((a, b) => a.path.localeCompare(b.path)) });
}

export function assertProposalIntegrity(proposal: Proposal): void {
  if (!/^proposal_[A-Za-z0-9_-]+$/.test(proposal.id)) throw new Error("Invalid proposal ID");
  if (!["candidate", "approved", "applied", "rejected"].includes(proposal.status)) throw new Error("Invalid proposal status");
  const { contentHash, ...payload } = proposal;
  // Status is mutable bookkeeping; the approved payload was created as a candidate.
  if (createHash("sha256").update(proposalPayload({ ...payload, status: "candidate" })).digest("hex") !== contentHash) {
    throw new Error("Proposal content hash mismatch");
  }
}

