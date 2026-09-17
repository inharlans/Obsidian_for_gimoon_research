import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const workspace = process.cwd();
const vaultRoot = path.resolve(workspace, process.argv[2] ?? "vault/PaperKG");
const outputPath = path.resolve(
  workspace,
  process.argv[3] ?? ".paperkg/cloudflare/paperkg.snapshot.json",
);
const approvedStatuses = new Set(["reviewed", "verified"]);
const privateKeys = new Set([
  "source_path",
  "local_path",
  "absolute_path",
  "file_path",
  "pdf_path",
  "attachment_path",
  "drive_path",
  "zotero_item",
  "zotero_attachment",
  "submitted_by_sha256",
  "idempotency_key_sha256",
]);

function isPrivateKey(key) {
  return privateKeys.has(key)
    || key.endsWith("_secret")
    || key.endsWith("_token");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanLink(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]$/);
  return (match?.[1] ?? text).trim();
}

function sanitize(value, key = "") {
  if (isPrivateKey(key)) return undefined;
  if (Array.isArray(value)) {
    return value.map((entry) => sanitize(entry)).filter((entry) => entry !== undefined);
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const sanitized = sanitize(childValue, childKey);
      if (sanitized !== undefined) result[childKey] = sanitized;
    }
    return result;
  }
  return value;
}

function summary(body) {
  return body
    .replace(
      /^>\s*\[!evidence\][^\r\n]*(?:\r?\n>[^\r\n]*)*/gim,
      "[Evidence available with paperkg.evidence.read]",
    )
    .slice(0, 12_000);
}

const files = await fg("**/*.md", {
  cwd: vaultRoot,
  absolute: true,
  onlyFiles: true,
  ignore: [".obsidian/**", ".paperkg/**"],
});

const notes = [];
for (const file of files.sort()) {
  const raw = await readFile(file, "utf8");
  const parsed = matter(raw);
  const metadata = sanitize(parsed.data);
  if (!metadata || !approvedStatuses.has(String(metadata.curation_status ?? ""))) continue;
  const id = String(metadata.id ?? "").trim();
  const type = String(metadata.type ?? "").trim();
  if (!id || !type) throw new Error(`Approved note is missing id/type: ${path.relative(vaultRoot, file)}`);
  const title = String(metadata.title ?? metadata.preferred_label ?? id).trim();
  const aliases = Array.isArray(metadata.aliases)
    ? metadata.aliases.map(String)
    : Array.isArray(metadata.alt_labels)
      ? metadata.alt_labels.map(String)
      : [];
  const body = parsed.content.trim();
  const publicSummary = summary(body);
  notes.push({
    id,
    type,
    title,
    aliases,
    metadata,
    body,
    summary: publicSummary,
    searchText: [id, title, type, ...aliases, publicSummary].join("\n").toLocaleLowerCase(),
  });
}

const duplicateIds = notes
  .map((note) => note.id)
  .filter((id, index, all) => all.indexOf(id) !== index);
if (duplicateIds.length) throw new Error(`Duplicate approved note IDs: ${[...new Set(duplicateIds)].join(", ")}`);

const aliases = {};
for (const note of notes) {
  for (const alias of [note.id, note.title, ...note.aliases]) {
    const key = alias.trim().toLocaleLowerCase();
    if (!key) continue;
    aliases[key] = [...new Set([...(aliases[key] ?? []), note.id])].sort();
  }
}

const edges = notes
  .filter((note) => note.type === "relation")
  .map((note) => ({
    id: note.id,
    subject: cleanLink(note.metadata.subject),
    predicate: String(note.metadata.predicate ?? ""),
    object: cleanLink(note.metadata.object),
    status: String(note.metadata.curation_status ?? ""),
    evidenceRefs: Array.isArray(note.metadata.evidence_refs)
      ? note.metadata.evidence_refs.map(cleanLink)
      : [],
  }));

notes.sort((left, right) => left.id.localeCompare(right.id));
edges.sort((left, right) => left.id.localeCompare(right.id));
const canonicalPayload = JSON.stringify({ notes, edges, aliases });
const snapshot = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  sourceRevision: sha256(canonicalPayload),
  noteCount: notes.length,
  notes,
  edges,
  aliases,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, noteCount: notes.length, edgeCount: edges.length, sourceRevision: snapshot.sourceRevision }, null, 2));
