import { createHash, randomBytes, randomUUID } from "node:crypto";
import { link, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { assertProposalIntegrity, proposalPayload } from "./proposal-integrity.js";
export { assertProposalIntegrity } from "./proposal-integrity.js";
import { scanVault } from "./markdown.js";
import { validateVault, type ValidationReport } from "./validation.js";

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
  if (path.isAbsolute(relative) || path.win32.isAbsolute(relative) || relative.includes("..") || relative.includes("\\") || relative.includes(":") || !relative.endsWith(".md")) {
    throw new Error(`Unsafe proposal path: ${relative}`);
  }
  const segments = relative.toLowerCase().split("/");
  if (segments.some(segment => !segment || segment.startsWith(".")) ||
      ["node_modules", "attachments", "00_system", "09_views", "10_inbox"].includes(segments[0]!) ||
      segments.at(-1) === "agents.md" || relative.toLowerCase() === "readme.md") {
    throw new Error(`Proposal path is outside validated knowledge notes: ${relative}`);
  }
  const root = path.resolve(vaultRoot);
  const target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error(`Path escapes vault: ${relative}`);
  return target;
}

async function preflight(vaultRoot: string, proposal: Proposal): Promise<void> {
  assertProposalIntegrity(proposal);
  if (!["candidate", "approved"].includes(proposal.status)) throw new Error(`Proposal is ${proposal.status}`);
  const seen = new Set<string>();
  const root = await realpath(vaultRoot);
  for (const operation of proposal.operations) {
    if (operation.op !== "create" && operation.op !== "update") throw new Error("Invalid proposal operation");
    const target = safeVaultPath(root, operation.path);
    const key = target.toLocaleLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate proposal path: ${operation.path}`);
    seen.add(key);
    // Reject symlinks/junctions, including existing parent directories.
    let current = target;
    while (current !== root) {
      try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symlink in proposal path: ${operation.path}`); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      current = path.dirname(current);
    }
    if (operation.op === "create") {
      try { await lstat(target); }
      catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw error; }
      throw new Error(`Create target already exists: ${operation.path}`);
    }
    if (!operation.baseSha256 || !/^[a-f0-9]{64}$/.test(operation.baseSha256)) throw new Error(`Update requires baseSha256: ${operation.path}`);
    if (sha256(await readFile(target)) !== operation.baseSha256) throw new Error(`Base revision changed: ${operation.path}`);
  }
}

export async function validateProposal(vaultRoot: string, proposal: Proposal): Promise<ValidationReport> {
  await preflight(vaultRoot, proposal);
  const preview = await mkdtemp(path.join(tmpdir(), "paperkg-proposal-"));
  try {
    for (const note of await scanVault(vaultRoot)) {
      const target = path.join(preview, note.relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await readFile(note.absolutePath));
    }
    for (const operation of proposal.operations) {
      const target = safeVaultPath(preview, operation.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, operation.content);
    }
    return { ...await validateVault(preview), vault: path.resolve(vaultRoot) };
  } finally { await rm(preview, { recursive: true, force: true }); }
}

export async function proposalDirectory(vaultRoot: string): Promise<string> {
  const dir = path.join(vaultRoot, "10_Inbox", "Proposals");
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveProposal(vaultRoot: string, proposal: Proposal): Promise<string> {
  assertProposalIntegrity(proposal);
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
  assertProposalIntegrity(proposal);
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
  assertProposalIntegrity(proposal);
  const approvalPath = path.join(vaultRoot, ".paperkg", "approvals", `${proposal.id}.json`);
  const approval = JSON.parse(await readFile(approvalPath, "utf8")) as ApprovalToken;
  if (approval.used || !Number.isFinite(Date.parse(approval.expiresAt)) || Date.parse(approval.expiresAt) <= Date.now()) throw new Error("Approval token is expired or used");
  if (approval.proposalId !== proposal.id || approval.proposalHash !== proposal.contentHash || approval.tokenHash !== sha256(token)) throw new Error("Approval token mismatch");
  const report = await validateProposal(vaultRoot, proposal);
  if (report.errors) throw new Error(`Proposal validation failed: ${report.issues.filter(issue => issue.severity === "error").map(issue => `${issue.file}: ${issue.message}`).join("; ")}`);
  // Check every base again after the preview, before the first canonical write.
  await preflight(vaultRoot, proposal);
  // Claim the token atomically so two simultaneous apply calls cannot both use it.
  const claimPath = `${approvalPath}.applying`;
  await link(approvalPath, claimPath);
  try {
    const latestApproval = JSON.parse(await readFile(approvalPath, "utf8")) as ApprovalToken;
    if (latestApproval.used || latestApproval.proposalId !== proposal.id || latestApproval.proposalHash !== proposal.contentHash || latestApproval.tokenHash !== sha256(token) || !Number.isFinite(Date.parse(latestApproval.expiresAt)) || Date.parse(latestApproval.expiresAt) <= Date.now()) throw new Error("Approval changed or expired during validation");
    for (const operation of proposal.operations) {
      const target = safeVaultPath(vaultRoot, operation.path);
      await mkdir(path.dirname(target), { recursive: true });
      if (operation.op === "update") {
        if (sha256(await readFile(target)) !== operation.baseSha256) throw new Error(`Base revision changed: ${operation.path}`);
      }
      const temporary = `${target}.paperkg-${randomUUID()}.tmp`;
      await writeFile(temporary, operation.content, { encoding: "utf8", flag: "wx" });
      try {
        if (operation.op === "create") await link(temporary, target);
        else await rename(temporary, target);
      } finally { await rm(temporary, { force: true }); }
    }
    approval.used = true;
    await writeFile(approvalPath, JSON.stringify(approval, null, 2), "utf8");
    await unlink(approvalPath);
  } finally { await unlink(claimPath); }
}
