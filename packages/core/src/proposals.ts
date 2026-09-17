import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface PatchOperation {
  op: "create" | "update";
  path: string;
  content: string;
  baseSha256?: string;
}

export interface Proposal {
  id: string;
  createdAt: string;
  createdBy: "codex" | "user" | "importer";
  rationale: string;
  operations: PatchOperation[];
  contentHash: string;
  status: "candidate" | "approved" | "applied" | "rejected";
}

export interface ApprovalToken {
  proposalId: string;
  proposalHash: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
}

export function sha256(content: string | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

function proposalPayload(value: Omit<Proposal, "contentHash">): string {
  return JSON.stringify({ ...value, operations: [...value.operations].sort((a, b) => a.path.localeCompare(b.path)) });
}

export function makeProposal(input: Omit<Proposal, "id" | "createdAt" | "contentHash" | "status">): Proposal {
  return makeDeterministicProposal({
    ...input,
    id: `proposal_${randomUUID()}`,
    createdAt: new Date().toISOString()
  });
}

export function makeDeterministicProposal(input: Omit<Proposal, "contentHash" | "status">): Proposal {
  const base = {
    status: "candidate" as const,
    ...input
  };
  return { ...base, contentHash: sha256(proposalPayload(base)) };
}

function safeVaultPath(vaultRoot: string, relative: string): string {
  if (path.isAbsolute(relative) || relative.includes("..") || !relative.endsWith(".md")) {
    throw new Error(`Unsafe proposal path: ${relative}`);
  }
  const root = path.resolve(vaultRoot);
  const target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Path escapes vault: ${relative}`);
  return target;
}

export async function proposalDirectory(vaultRoot: string): Promise<string> {
  const dir = path.join(vaultRoot, "10_Inbox", "Proposals");
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveProposal(vaultRoot: string, proposal: Proposal): Promise<string> {
  for (const operation of proposal.operations) safeVaultPath(vaultRoot, operation.path);
  const target = path.join(await proposalDirectory(vaultRoot), `${proposal.id}.json`);
  await writeFile(target, `${JSON.stringify(proposal, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return target;
}

export async function loadProposal(vaultRoot: string, id: string): Promise<Proposal> {
  const target = path.join(await proposalDirectory(vaultRoot), `${path.basename(id)}.json`);
  return JSON.parse(await readFile(target, "utf8")) as Proposal;
}

export async function setProposalStatus(vaultRoot: string, id: string, status: Proposal["status"]): Promise<Proposal> {
  const directory = await proposalDirectory(vaultRoot);
  const target = path.join(directory, `${path.basename(id)}.json`);
  const proposal = await loadProposal(vaultRoot, id);
  const updated = { ...proposal, status };
  const temporary = `${target}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  await rename(temporary, target);
  return updated;
}

export async function approveProposal(vaultRoot: string, proposal: Proposal, ttlMinutes = 15): Promise<string> {
  if (proposal.status !== "candidate") throw new Error(`Proposal is ${proposal.status}`);
  const token = randomBytes(24).toString("base64url");
  const record: ApprovalToken = {
    proposalId: proposal.id,
    proposalHash: proposal.contentHash,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000).toISOString(),
    used: false
  };
  const dir = path.join(vaultRoot, ".paperkg", "approvals");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${proposal.id}.json`), JSON.stringify(record, null, 2), { encoding: "utf8", flag: "wx" });
  return token;
}

export async function applyProposal(vaultRoot: string, proposal: Proposal, token: string): Promise<void> {
  const approvalPath = path.join(vaultRoot, ".paperkg", "approvals", `${proposal.id}.json`);
  const approval = JSON.parse(await readFile(approvalPath, "utf8")) as ApprovalToken;
  if (approval.used || Date.parse(approval.expiresAt) < Date.now()) throw new Error("Approval token is expired or used");
  if (approval.proposalHash !== proposal.contentHash || approval.tokenHash !== sha256(token)) throw new Error("Approval token mismatch");
  for (const operation of proposal.operations) {
    const target = safeVaultPath(vaultRoot, operation.path);
    await mkdir(path.dirname(target), { recursive: true });
    if (operation.op === "update") {
      await stat(target);
      if (operation.baseSha256 && sha256(await readFile(target)) !== operation.baseSha256) throw new Error(`Base revision changed: ${operation.path}`);
    }
    const temporary = `${target}.paperkg-${randomUUID()}.tmp`;
    await writeFile(temporary, operation.content, "utf8");
    await rename(temporary, target);
  }
  approval.used = true;
  await writeFile(approvalPath, JSON.stringify(approval, null, 2), "utf8");
  await unlink(approvalPath);
}
