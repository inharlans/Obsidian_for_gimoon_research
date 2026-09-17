import type { Env, PaperKgSnapshot, SnapshotEdge, SnapshotNote } from "./types.js";

const SNAPSHOT_KEY = "snapshot/paperkg.snapshot.json";
let cached: { revision: string; snapshot: PaperKgSnapshot } | undefined;

export async function loadSnapshot(env: Env): Promise<PaperKgSnapshot> {
  const object = await env.PAPERKG_STORAGE.get(SNAPSHOT_KEY);
  if (!object) throw new Error("PaperKG snapshot has not been published yet");
  const revision = object.httpEtag;
  if (cached?.revision === revision) return cached.snapshot;
  const snapshot = await object.json<PaperKgSnapshot>();
  if (snapshot.schemaVersion !== "1.0" || snapshot.noteCount !== snapshot.notes.length) {
    throw new Error("Invalid PaperKG snapshot");
  }
  cached = { revision, snapshot };
  return snapshot;
}

export function cleanLink(value: unknown): string {
  const text = String(value ?? "").trim();
  const match = text.match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]$/);
  return (match?.[1] ?? text).trim();
}

export function resolve(snapshot: PaperKgSnapshot, query: string): SnapshotNote[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const ids = snapshot.aliases[normalized] ?? [];
  const exact = ids.flatMap((id) => snapshot.notes.filter((note) => note.id === id));
  if (exact.length) return exact;
  return snapshot.notes.filter((note) => note.id.toLocaleLowerCase() === normalized);
}

export function noteByIdOrAlias(snapshot: PaperKgSnapshot, query: string): SnapshotNote | undefined {
  return resolve(snapshot, query)[0];
}

export function notesByType(snapshot: PaperKgSnapshot, type: string): SnapshotNote[] {
  return snapshot.notes.filter((note) => note.type === type);
}

export function search(snapshot: PaperKgSnapshot, query: string, limit: number, type?: string, includeEvidence = false): SnapshotNote[] {
  const exact = resolve(snapshot, query).filter((note) => !type || note.type === type);
  if (exact.length) return exact.slice(0, limit);
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return snapshot.notes
    .filter((note) => !type || note.type === type)
    .map((note) => {
      const title = note.title.toLocaleLowerCase();
      const aliasText = note.aliases.join(" ").toLocaleLowerCase();
      const searchableText = includeEvidence
        ? `${note.searchText}\n${note.body.toLocaleLowerCase()}`
        : note.searchText;
      let score = 0;
      for (const term of terms) {
        if (title === term) score += 50;
        if (title.includes(term)) score += 15;
        if (aliasText.includes(term)) score += 12;
        if (searchableText.includes(term)) score += 2;
      }
      return { note, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.note.title.localeCompare(right.note.title))
    .slice(0, limit)
    .map((entry) => entry.note);
}

export function linkedNotes(snapshot: PaperKgSnapshot, value: unknown): SnapshotNote[] {
  const entries = Array.isArray(value) ? value : value ? [value] : [];
  return entries.flatMap((entry) => resolve(snapshot, cleanLink(entry)));
}

export function edgesFor(snapshot: PaperKgSnapshot, noteId: string): { incoming: SnapshotEdge[]; outgoing: SnapshotEdge[] } {
  return {
    incoming: snapshot.edges.filter((edge) => edge.object === noteId),
    outgoing: snapshot.edges.filter((edge) => edge.subject === noteId),
  };
}

export function publicNote(note: SnapshotNote, baseUrl: string, includeEvidence: boolean): Record<string, unknown> {
  const evidenceRestricted = note.type === "evidence" && !includeEvidence;
  const metadata = evidenceRestricted
    ? Object.fromEntries([
      "id",
      "type",
      "schema_version",
      "title",
      "aliases",
      "curation_status",
    ].flatMap((key) => key in note.metadata ? [[key, note.metadata[key]]] : []))
    : note.metadata;
  return {
    id: note.id,
    type: note.type,
    title: note.title,
    aliases: note.aliases,
    url: `${baseUrl.replace(/\/$/, "")}/mcp/v1/notes/${encodeURIComponent(note.id)}`,
    metadata,
    text: includeEvidence
      ? note.body
      : evidenceRestricted
        ? "Evidence content requires paperkg.evidence.read."
        : note.summary,
    evidencePolicy: includeEvidence ? "approved-body-included" : "evidence-scope-required",
  };
}
