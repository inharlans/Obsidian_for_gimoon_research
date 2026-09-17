import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  exactResolve, normalizeWikilink, resultSetBlockSchema, scanVault, textRank, type VaultNote
} from "@paperkg/core";
import { cosineOfNormalized, embedLocally, LOCAL_VECTOR_DIMENSIONS, LOCAL_VECTOR_MODEL } from "./localEmbedding.js";

export interface IndexedSearchResult {
  id: string;
  title: string;
  type: string;
  path: string;
  section: string;
  snippet: string;
  rank: number;
}

export interface IndexedNote {
  id: string;
  type: string;
  title: string;
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export function defaultDatabasePath(vaultRoot: string): string {
  return path.join(vaultRoot, ".paperkg", "paperkg.db");
}

function createSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE, frontmatter_json TEXT NOT NULL, body TEXT NOT NULL,
      curation_status TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS aliases (alias TEXT NOT NULL, note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE);
    CREATE INDEX IF NOT EXISTS aliases_lookup ON aliases(alias COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS external_ids (kind TEXT NOT NULL, value TEXT NOT NULL, note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE);
    CREATE UNIQUE INDEX IF NOT EXISTS external_ids_unique ON external_ids(kind, value);
    CREATE TABLE IF NOT EXISTS properties (note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE, key TEXT NOT NULL, value_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS edges (
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT NOT NULL,
      predicate TEXT NOT NULL, target_id TEXT NOT NULL, relation_id TEXT,
      evidence_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'reviewed'
    );
    CREATE INDEX IF NOT EXISTS edges_source ON edges(source_id, predicate);
    CREATE INDEX IF NOT EXISTS edges_target ON edges(target_id, predicate);
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY, note_id TEXT NOT NULL, source_version TEXT,
      location TEXT, summary TEXT NOT NULL, status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS result_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_set_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      benchmark_use_id TEXT NOT NULL,
      system TEXT NOT NULL,
      metric_id TEXT,
      value REAL,
      unit TEXT NOT NULL,
      dispersion REAL,
      dispersion_kind TEXT,
      baseline INTEGER NOT NULL,
      value_text TEXT NOT NULL,
      evidence_id TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS result_rows_benchmark_use ON result_rows(benchmark_use_id);
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      section TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, evidence_ref TEXT
    );
    CREATE TABLE IF NOT EXISTS embeddings (
      chunk_id INTEGER PRIMARY KEY REFERENCES chunks(id) ON DELETE CASCADE,
      dimensions INTEGER NOT NULL, model TEXT NOT NULL, vector_json TEXT NOT NULL
    );
    DROP TABLE IF EXISTS chunks_fts;
    CREATE VIRTUAL TABLE chunks_fts USING fts5(title, body, note_id UNINDEXED, section UNINDEXED);
    CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, status TEXT NOT NULL, content_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, happened_at TEXT NOT NULL, action TEXT NOT NULL, subject TEXT NOT NULL, metadata_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS index_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
}

function sectionChunks(note: VaultNote): Array<{ section: string; body: string; evidenceRef?: string }> {
  const chunks: Array<{ section: string; body: string; evidenceRef?: string }> = [];
  const lines = note.body.split(/\r?\n/);
  let heading = "Document";
  let buffer: string[] = [];
  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body) {
      const evidenceRef = body.match(/\^(ev_[A-Za-z0-9_-]+)$/m)?.[1];
      chunks.push(evidenceRef ? { section: heading, body, evidenceRef } : { section: heading, body });
    }
    buffer = [];
  };
  for (const line of lines) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) { flush(); heading = match[1]!.trim(); } else buffer.push(line);
  }
  flush();
  return chunks.length > 0 ? chunks : [{ section: "Document", body: note.body }];
}

function resolvedId(link: unknown, resolver: Map<string, string>): string | undefined {
  if (typeof link !== "string") return undefined;
  return resolver.get(normalizeWikilink(link).toLocaleLowerCase());
}

export async function rebuildIndex(vaultRoot: string, databasePath = defaultDatabasePath(vaultRoot)): Promise<{ notes: number; chunks: number; embeddings: number; edges: number; databasePath: string }> {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  createSchema(db);
  db.exec("BEGIN IMMEDIATE; DELETE FROM chunks_fts; DELETE FROM embeddings; DELETE FROM chunks; DELETE FROM result_rows; DELETE FROM evidence; DELETE FROM edges; DELETE FROM properties; DELETE FROM external_ids; DELETE FROM aliases; DELETE FROM notes;");
  let chunkCount = 0;
  let edgeCount = 0;
  try {
    const notes = await scanVault(vaultRoot);
    const valid = notes.filter((note) => note.data);
    const resolver = new Map<string, string>();
    for (const note of valid) {
      const data = note.data!;
      for (const key of [data.id, data.title, note.basename, ...(data.aliases ?? [])]) resolver.set(key.toLocaleLowerCase(), data.id);
    }
    const explicitEdgeKeys = new Set<string>();
    for (const note of valid.filter((candidate) => candidate.data?.type === "relation")) {
      const source = resolvedId(note.frontmatter.subject, resolver);
      const target = resolvedId(note.frontmatter.object, resolver);
      if (source && target) explicitEdgeKeys.add(`${source}\u0000${String(note.frontmatter.predicate)}\u0000${target}`);
    }
    const insertNote = db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertAlias = db.prepare("INSERT INTO aliases VALUES (?, ?)");
    const insertExternal = db.prepare("INSERT OR IGNORE INTO external_ids VALUES (?, ?, ?)");
    const insertProperty = db.prepare("INSERT INTO properties VALUES (?, ?, ?)");
    const insertChunk = db.prepare("INSERT INTO chunks(note_id, section, title, body, evidence_ref) VALUES (?, ?, ?, ?, ?)");
    const insertFts = db.prepare("INSERT INTO chunks_fts(rowid, title, body, note_id, section) VALUES (?, ?, ?, ?, ?)");
    const insertEmbedding = db.prepare("INSERT INTO embeddings(chunk_id, dimensions, model, vector_json) VALUES (?, ?, ?, ?)");
    const insertEdge = db.prepare("INSERT INTO edges(source_id, predicate, target_id, relation_id, evidence_json, status) VALUES (?, ?, ?, ?, ?, ?)");
    const insertEvidence = db.prepare("INSERT OR REPLACE INTO evidence VALUES (?, ?, ?, ?, ?, ?)");
    const insertResultRow = db.prepare(`
      INSERT INTO result_rows(result_set_id, benchmark_use_id, system, metric_id, value, unit, dispersion, dispersion_kind, baseline, value_text, evidence_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const derivedEdgeKeys = new Set<string>();
    const addDerivedEdge = (source: string | undefined, predicate: string, target: string | undefined, status: string): void => {
      if (!source || !target) return;
      const key = `${source}\u0000${predicate}\u0000${target}`;
      if (explicitEdgeKeys.has(key) || derivedEdgeKeys.has(key)) return;
      insertEdge.run(source, predicate, target, null, "[]", status);
      derivedEdgeKeys.add(key);
      edgeCount += 1;
    };

    for (const note of valid) {
      const data = note.data!;
      insertNote.run(data.id, data.type, data.title, note.relativePath, JSON.stringify(note.frontmatter), note.body, data.curation_status, new Date().toISOString());
      for (const alias of data.aliases ?? []) insertAlias.run(alias, data.id);
      for (const [kind, value] of Object.entries((data.external_ids ?? {}) as Record<string, string>)) insertExternal.run(kind, value, data.id);
      for (const [key, value] of Object.entries(note.frontmatter)) insertProperty.run(data.id, key, JSON.stringify(value));
      for (const chunk of sectionChunks(note)) {
        const result = insertChunk.run(data.id, chunk.section, data.title, chunk.body, chunk.evidenceRef ?? null);
        const chunkId = Number(result.lastInsertRowid);
        insertFts.run(chunkId, data.title, chunk.body, data.id, chunk.section);
        insertEmbedding.run(chunkId, LOCAL_VECTOR_DIMENSIONS, LOCAL_VECTOR_MODEL, JSON.stringify(embedLocally(`${data.title}\n${chunk.section}\n${chunk.body}`)));
        chunkCount += 1;
      }
      if (data.type === "relation") {
        const source = resolvedId(note.frontmatter.subject, resolver);
        const target = resolvedId(note.frontmatter.object, resolver);
        if (source && target) {
          insertEdge.run(source, String(note.frontmatter.predicate), target, data.id, JSON.stringify(data.evidence_refs ?? []), data.curation_status);
          edgeCount += 1;
        }
      }
      const version = resolvedId(note.frontmatter.paper_version, resolver) ?? resolvedId(note.frontmatter.source_version, resolver);
      addDerivedEdge(data.id, "part_of_version", version, data.curation_status);
      if (data.type === "paper_version") addDerivedEdge(data.id, "is_version_of", resolvedId(note.frontmatter.work, resolver), data.curation_status);
      if (data.type === "benchmark_use") {
        addDerivedEdge(data.id, "uses_benchmark", resolvedId(note.frontmatter.benchmark, resolver), data.curation_status);
        for (const protocol of Array.isArray(note.frontmatter.protocols) ? note.frontmatter.protocols : []) {
          addDerivedEdge(data.id, "uses_protocol", resolvedId(protocol, resolver), data.curation_status);
        }
        for (const metric of Array.isArray(note.frontmatter.metrics) ? note.frontmatter.metrics : []) {
          addDerivedEdge(data.id, "reports_metric", resolvedId(metric, resolver), data.curation_status);
        }
        for (const resultSet of Array.isArray(note.frontmatter.result_sets) ? note.frontmatter.result_sets : []) {
          addDerivedEdge(data.id, "reports_result", resolvedId(resultSet, resolver), data.curation_status);
        }
      }
      if (data.type === "evidence") {
        insertEvidence.run(data.id, data.id, String(note.frontmatter.source_version ?? ""), String(note.frontmatter.location ?? ""), String(note.frontmatter.summary ?? ""), String(note.frontmatter.evidence_status ?? "missing"));
      }
      if (data.type === "result_set") {
        for (const candidate of note.resultSetBlocks) {
          const parsed = resultSetBlockSchema.safeParse(candidate.value);
          if (!parsed.success) continue;
          for (const row of parsed.data.rows) {
            insertResultRow.run(
              data.id,
              resolvedId(row.benchmark_use, resolver) ?? normalizeWikilink(row.benchmark_use),
              row.system,
              row.metric ? (resolvedId(row.metric, resolver) ?? normalizeWikilink(row.metric)) : null,
              row.value ?? null,
              row.unit,
              row.dispersion ?? null,
              row.dispersion_kind ?? null,
              row.baseline ? 1 : 0,
              row.value_text,
              resolvedId(row.evidence_ref, resolver) ?? normalizeWikilink(row.evidence_ref)
            );
          }
        }
      }
    }
    db.prepare("INSERT OR REPLACE INTO index_state VALUES ('rebuilt_at', ?)").run(new Date().toISOString());
    db.exec("COMMIT");
    return { notes: valid.length, chunks: chunkCount, embeddings: chunkCount, edges: edgeCount, databasePath };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.close();
  }
}

export class PaperKgIndex {
  private readonly db: DatabaseSync;

  constructor(public readonly databasePath: string) {
    this.db = new DatabaseSync(databasePath, { readOnly: true });
  }

  close(): void { this.db.close(); }

  lexical(query: string, limit = 20): IndexedSearchResult[] {
    const terms = query.trim().split(/\s+/).filter(Boolean).map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR ");
    if (!terms) return [];
    const rows = this.db.prepare(`
      SELECT n.id, n.title, n.type, n.path, f.section,
             snippet(chunks_fts, 1, '<mark>', '</mark>', ' … ', 24) AS snippet,
             bm25(chunks_fts, 5.0, 1.0) AS rank
      FROM chunks_fts f JOIN notes n ON n.id = f.note_id
      WHERE chunks_fts MATCH ?
      ORDER BY rank LIMIT ?
    `).all(terms, Math.max(1, Math.min(limit, 100))) as unknown as IndexedSearchResult[];
    return rows;
  }

  semantic(query: string, limit = 20): IndexedSearchResult[] {
    const queryVector = embedLocally(query);
    const rows = this.db.prepare(`
      SELECT n.id, n.title, n.type, n.path, c.section, c.body, e.vector_json
      FROM embeddings e JOIN chunks c ON c.id=e.chunk_id JOIN notes n ON n.id=c.note_id
    `).all() as Array<Record<string, unknown>>;
    return rows.map((row) => {
      const score = cosineOfNormalized(queryVector, JSON.parse(String(row.vector_json)) as number[]);
      return {
        id: String(row.id), title: String(row.title), type: String(row.type), path: String(row.path),
        section: String(row.section), snippet: String(row.body).slice(0, 280), rank: -score
      };
    }).filter((row) => row.rank < 0).sort((left, right) => left.rank - right.rank).slice(0, Math.max(1, Math.min(limit, 100)));
  }

  search(query: string, limit = 20): IndexedSearchResult[] {
    const candidateLimit = Math.max(20, Math.min(limit * 4, 100));
    const lexical = this.lexical(query, candidateLimit);
    const semantic = this.semantic(query, candidateLimit);
    const fused = new Map<string, { result: IndexedSearchResult; score: number }>();
    for (const ranking of [lexical, semantic]) {
      ranking.forEach((result, index) => {
        const key = `${result.id}\u0000${result.section}`;
        const current = fused.get(key) ?? { result, score: 0 };
        if (ranking === lexical) current.result = result;
        current.score += 1 / (60 + index + 1);
        fused.set(key, current);
      });
    }
    return [...fused.values()].sort((left, right) => right.score - left.score).slice(0, Math.max(1, Math.min(limit, 100))).map(({ result, score }) => ({ ...result, rank: -score }));
  }

  exact(query: string): IndexedNote[] {
    const rows = this.db.prepare(`
      SELECT DISTINCT n.id, n.type, n.title, n.path, n.frontmatter_json, n.body
      FROM notes n LEFT JOIN aliases a ON a.note_id=n.id LEFT JOIN external_ids e ON e.note_id=n.id
      WHERE lower(n.id)=lower(?) OR lower(n.title)=lower(?) OR lower(a.alias)=lower(?) OR lower(e.value)=lower(?)
    `).all(query, query, query, query) as Array<Record<string, unknown>>;
    return rows.map(rowToNote);
  }

  get(id: string): IndexedNote | undefined {
    const row = this.db.prepare("SELECT id,type,title,path,frontmatter_json,body FROM notes WHERE id=? OR path=?").get(id, id) as Record<string, unknown> | undefined;
    return row ? rowToNote(row) : undefined;
  }

  notesByType(type: string): IndexedNote[] {
    return (this.db.prepare("SELECT id,type,title,path,frontmatter_json,body FROM notes WHERE type=? ORDER BY title").all(type) as Array<Record<string, unknown>>).map(rowToNote);
  }

  outgoing(id: string, predicates: string[] = []): Array<Record<string, unknown>> {
    if (predicates.length === 0) return this.db.prepare("SELECT * FROM edges WHERE source_id=? ORDER BY predicate,target_id").all(id) as Array<Record<string, unknown>>;
    const marks = predicates.map(() => "?").join(",");
    return this.db.prepare(`SELECT * FROM edges WHERE source_id=? AND predicate IN (${marks}) ORDER BY predicate,target_id`).all(id, ...predicates) as Array<Record<string, unknown>>;
  }

  incoming(id: string, predicates: string[] = []): Array<Record<string, unknown>> {
    if (predicates.length === 0) return this.db.prepare("SELECT * FROM edges WHERE target_id=? ORDER BY predicate,source_id").all(id) as Array<Record<string, unknown>>;
    const marks = predicates.map(() => "?").join(",");
    return this.db.prepare(`SELECT * FROM edges WHERE target_id=? AND predicate IN (${marks}) ORDER BY predicate,source_id`).all(id, ...predicates) as Array<Record<string, unknown>>;
  }

  resultRows(benchmarkUseId?: string): Array<Record<string, unknown>> {
    if (benchmarkUseId) return this.db.prepare("SELECT * FROM result_rows WHERE benchmark_use_id=? ORDER BY baseline,system,metric_id").all(benchmarkUseId) as Array<Record<string, unknown>>;
    return this.db.prepare("SELECT * FROM result_rows ORDER BY result_set_id,benchmark_use_id,baseline,system,metric_id").all() as Array<Record<string, unknown>>;
  }
}

function rowToNote(row: Record<string, unknown>): IndexedNote {
  return {
    id: String(row.id), type: String(row.type), title: String(row.title), path: String(row.path),
    frontmatter: JSON.parse(String(row.frontmatter_json)) as Record<string, unknown>, body: String(row.body)
  };
}

export async function searchWithoutIndex(vaultRoot: string, query: string, limit = 20): Promise<IndexedSearchResult[]> {
  const notes = await scanVault(vaultRoot);
  const exact = exactResolve(notes, query);
  const ranked = exact.length > 0 ? exact.map((note) => ({ note, score: 1000 })) : textRank(notes, query);
  return ranked.slice(0, limit).map(({ note, score }) => ({
    id: String(note.data?.id ?? note.basename), title: String(note.data?.title ?? note.basename),
    type: String(note.data?.type ?? "unknown"), path: note.relativePath,
    section: "Document", snippet: note.body.slice(0, 280), rank: -score
  }));
}
