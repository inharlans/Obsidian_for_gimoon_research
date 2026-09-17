import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  cleanLink,
  edgesFor,
  linkedNotes,
  loadSnapshot,
  noteByIdOrAlias,
  notesByType,
  publicNote,
  search,
} from "./snapshot.js";
import type { Env, PaperKgSnapshot, SnapshotNote } from "./types.js";

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function requireRead(scopes: string[]): void {
  if (!scopes.includes("paperkg.read")) throw new Error("OAuth scope paperkg.read is required");
}

function paperVersions(snapshot: PaperKgSnapshot, paper: SnapshotNote): SnapshotNote[] {
  return linkedNotes(snapshot, paper.metadata.versions);
}

function paperVersionIds(snapshot: PaperKgSnapshot, paper: SnapshotNote): Set<string> {
  return new Set(paperVersions(snapshot, paper).map((note) => note.id));
}

function usesForVersions(snapshot: PaperKgSnapshot, versionIds: Set<string>): SnapshotNote[] {
  return notesByType(snapshot, "benchmark_use").filter((note) => versionIds.has(cleanLink(note.metadata.paper_version)));
}

function limitationsForVersions(snapshot: PaperKgSnapshot, versionIds: Set<string>): SnapshotNote[] {
  return notesByType(snapshot, "limitation_occurrence").filter((note) => versionIds.has(cleanLink(note.metadata.paper_version)));
}

export function resolveDistinctPaperWorks(snapshot: PaperKgSnapshot, paperIds: string[]): SnapshotNote[] {
  const resolved = paperIds.map((id) => ({ id, note: noteByIdOrAlias(snapshot, id) }));
  const unknown = resolved.filter(({ note }) => !note || note.type !== "paper_work").map(({ id }) => id);
  if (unknown.length) throw new Error(`Unknown paper work(s): ${unknown.join(", ")}`);
  const papers = resolved.map(({ note }) => note!);
  if (new Set(papers.map((paper) => paper.id)).size !== papers.length) {
    throw new Error("paper_ids must resolve to distinct paper works");
  }
  return papers;
}

export function boundedItems<T>(items: T[], maxItems: number): { items: T[]; truncated: boolean } {
  return { items: items.slice(0, maxItems), truncated: items.length > maxItems };
}

export function createPaperKgMcpServer(env: Env, scopes: string[]): McpServer {
  const includeEvidence = scopes.includes("paperkg.evidence.read");
  const server = new McpServer({ name: "PaperKG", version: "0.1.0" }, {
    instructions: "Evidence-grounded scholarly knowledge graph. Resolve aliases before fuzzy search. Treat author statements separately from curator interpretations. Never rank benchmark scores unless comparability_status is exact. This remote server is read-only.",
  });

  server.registerTool("search", {
    title: "Search PaperKG",
    description: "Search approved PaperKG papers and scholarly entities. Use exact aliases and identifiers first.",
    inputSchema: { query: z.string().min(1).max(500) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ query }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    return textResult({ results: search(snapshot, query, 20, undefined, includeEvidence).map((note) => ({ id: note.id, title: note.title, url: `${env.PUBLIC_BASE_URL}/mcp/v1/notes/${encodeURIComponent(note.id)}` })) });
  });

  server.registerTool("fetch", {
    title: "Fetch PaperKG item",
    description: "Fetch one approved PaperKG item selected from search.",
    inputSchema: { id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const note = noteByIdOrAlias(snapshot, id);
    if (!note) throw new Error(`Unknown PaperKG item: ${id}`);
    return textResult(publicNote(note, env.PUBLIC_BASE_URL, includeEvidence));
  });

  server.registerTool("search_papers", {
    title: "Search papers",
    description: "Search paper works by title, alias, identifier, venue, topic, or approved text.",
    inputSchema: { query: z.string().min(1).max(500), limit: z.number().int().min(1).max(50).default(20) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ query, limit }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    return textResult({ results: search(snapshot, query, limit, "paper_work", includeEvidence).map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)) });
  });

  server.registerTool("get_paper", {
    title: "Get paper",
    description: "Get a paper work, versions, benchmark uses, limitations, and evidence-aware metadata.",
    inputSchema: { paper_id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ paper_id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const paper = noteByIdOrAlias(snapshot, paper_id);
    if (!paper || paper.type !== "paper_work") throw new Error(`Unknown paper work: ${paper_id}`);
    const versions = paperVersions(snapshot, paper);
    const versionIds = new Set(versions.map((note) => note.id));
    return textResult({
      paper: publicNote(paper, env.PUBLIC_BASE_URL, includeEvidence),
      versions: versions.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)),
      benchmarkUses: usesForVersions(snapshot, versionIds).map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)),
      limitations: limitationsForVersions(snapshot, versionIds).map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)),
    });
  });

  server.registerTool("get_entity", {
    title: "Get scholarly entity",
    description: "Get an exact problem, method, benchmark, claim, limitation, relation, or other approved entity.",
    inputSchema: { entity_id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ entity_id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const note = noteByIdOrAlias(snapshot, entity_id);
    if (!note) throw new Error(`Unknown entity: ${entity_id}`);
    return textResult({ entity: publicNote(note, env.PUBLIC_BASE_URL, includeEvidence), ...edgesFor(snapshot, note.id) });
  });

  server.registerTool("get_benchmark_usage", {
    title: "Get benchmark usage",
    description: "Find paper-specific uses of a benchmark with purpose, protocols, metrics, results, and comparability warnings.",
    inputSchema: { benchmark_id: z.string().min(1).max(300), include_results: z.boolean().default(true) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ benchmark_id, include_results }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const benchmark = noteByIdOrAlias(snapshot, benchmark_id);
    const targetIds = new Set([benchmark_id.toLocaleLowerCase(), benchmark?.id.toLocaleLowerCase(), benchmark?.title.toLocaleLowerCase()].filter((item): item is string => Boolean(item)));
    const uses = notesByType(snapshot, "benchmark_use").filter((note) => targetIds.has(cleanLink(note.metadata.benchmark).toLocaleLowerCase()));
    const useIds = new Set(uses.map((note) => note.id));
    const assessments = notesByType(snapshot, "comparison_assessment").filter((note) => useIds.has(cleanLink(note.metadata.left_use)) && useIds.has(cleanLink(note.metadata.right_use)));
    return textResult({ benchmark: benchmark ? publicNote(benchmark, env.PUBLIC_BASE_URL, includeEvidence) : null, uses: uses.map((note) => {
      const value = publicNote(note, env.PUBLIC_BASE_URL, includeEvidence);
      if (!include_results) value.metadata = { ...(value.metadata as Record<string, unknown>), result_sets: [] };
      return value;
    }), assessments: assessments.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)) });
  });

  server.registerTool("compare_papers", {
    title: "Compare papers",
    description: "Compare two to ten papers without ranking scores whose BenchmarkUse is not exactly comparable.",
    inputSchema: { paper_ids: z.array(z.string()).min(2).max(10), profile: z.string().default("universal"), include_evidence: z.boolean().default(false) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ paper_ids, profile, include_evidence }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const requestedEvidence = includeEvidence && include_evidence;
    const papers = resolveDistinctPaperWorks(snapshot, paper_ids);
    return textResult({
      profile,
      warning: "Rank scores only when a pairwise ComparisonAssessment is exact; otherwise explain the recorded protocol differences.",
      papers: papers.map((paper) => {
        const versions = paperVersions(snapshot, paper);
        const ids = new Set(versions.map((note) => note.id));
        return {
          paper: publicNote(paper, env.PUBLIC_BASE_URL, requestedEvidence),
          versions: versions.map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          contributions: notesByType(snapshot, "contribution").filter((note) => ids.has(cleanLink(note.metadata.paper_version))).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          claims: notesByType(snapshot, "claim").filter((note) => ids.has(cleanLink(note.metadata.paper_version))).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          methods: notesByType(snapshot, "method").filter((note) => ids.has(cleanLink(note.metadata.introduced_by))).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          benchmarkUses: usesForVersions(snapshot, ids).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          resultSets: notesByType(snapshot, "result_set").filter((note) => ids.has(cleanLink(note.metadata.paper_version))).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
          limitations: limitationsForVersions(snapshot, ids).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
        };
      }),
      assessments: notesByType(snapshot, "comparison_assessment").filter((note) => {
        const ids = new Set(papers.flatMap((paper) => paperVersions(snapshot, paper)).flatMap((version) => usesForVersions(snapshot, new Set([version.id]))).map((use) => use.id));
        return ids.has(cleanLink(note.metadata.left_use)) && ids.has(cleanLink(note.metadata.right_use));
      }).map((note) => publicNote(note, env.PUBLIC_BASE_URL, requestedEvidence)),
    });
  });

  server.registerTool("trace_problem_evolution", {
    title: "Trace problem evolution",
    description: "Trace how approved paper versions frame, reframe, address, or leave a normalized problem open.",
    inputSchema: { problem_id: z.string().min(1).max(300), date_basis: z.enum(["first_public_date", "venue_event_date"]).default("first_public_date") },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ problem_id, date_basis }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const problem = noteByIdOrAlias(snapshot, problem_id);
    const candidates = new Set([problem_id.toLocaleLowerCase(), problem?.id.toLocaleLowerCase(), problem?.title.toLocaleLowerCase()].filter((item): item is string => Boolean(item)));
    const framings = notesByType(snapshot, "problem_framing").filter((note) => candidates.has(cleanLink(note.metadata.problem).toLocaleLowerCase()));
    const versionIds = new Set(framings.map((note) => cleanLink(note.metadata.paper_version)));
    const relevantIds = new Set([...candidates, ...framings.map((note) => note.id.toLocaleLowerCase()), ...[...versionIds].map((id) => id.toLocaleLowerCase())]);
    const predicates = new Set(["addresses", "partially_addresses", "leaves_open", "reframes", "reopens", "inherits_problem", "introduces_problem", "chronologically_after"]);
    const relations = notesByType(snapshot, "relation").filter((note) => predicates.has(String(note.metadata.predicate)) && (
      relevantIds.has(cleanLink(note.metadata.subject).toLocaleLowerCase()) || relevantIds.has(cleanLink(note.metadata.object).toLocaleLowerCase())
    ));
    return textResult({
      problem: problem ? publicNote(problem, env.PUBLIC_BASE_URL, includeEvidence) : null,
      problemId: problem?.id ?? problem_id,
      dateBasis: date_basis,
      framings: framings.map((note) => {
        const version = noteByIdOrAlias(snapshot, cleanLink(note.metadata.paper_version));
        return { framing: publicNote(note, env.PUBLIC_BASE_URL, includeEvidence), paperVersion: version ? publicNote(version, env.PUBLIC_BASE_URL, includeEvidence) : null };
      }),
      relations: relations.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence))
    });
  });

  server.registerTool("find_shared_limitations", {
    title: "Find shared limitations",
    description: "Find version-specific occurrences of the same normalized limitation with provenance.",
    inputSchema: { limitation_id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ limitation_id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const limitation = noteByIdOrAlias(snapshot, limitation_id);
    const candidates = new Set([limitation_id.toLocaleLowerCase(), limitation?.id.toLocaleLowerCase(), limitation?.title.toLocaleLowerCase()].filter((item): item is string => Boolean(item)));
    const occurrences = notesByType(snapshot, "limitation_occurrence").filter((note) => candidates.has(cleanLink(note.metadata.limitation).toLocaleLowerCase()));
    return textResult({ limitation: limitation ? publicNote(limitation, env.PUBLIC_BASE_URL, includeEvidence) : null, occurrences: occurrences.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)) });
  });

  server.registerTool("get_claim_evidence", {
    title: "Get claim evidence",
    description: "Get an approved claim, its evidence references, and supporting or contradicting relations.",
    inputSchema: { claim_id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ claim_id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const claim = noteByIdOrAlias(snapshot, claim_id);
    if (!claim || claim.type !== "claim") throw new Error(`Unknown claim: ${claim_id}`);
    const evidence = includeEvidence ? linkedNotes(snapshot, claim.metadata.evidence_refs).map((note) => publicNote(note, env.PUBLIC_BASE_URL, true)) : [];
    return textResult({ claim: publicNote(claim, env.PUBLIC_BASE_URL, includeEvidence), evidence, ...edgesFor(snapshot, claim.id), evidencePolicy: includeEvidence ? "included" : "paperkg.evidence.read required" });
  });

  server.registerTool("get_version_diff", {
    title: "Get paper version diff",
    description: "Compare approved metadata and structured content of two paper versions.",
    inputSchema: { left_version_id: z.string().min(1).max(300), right_version_id: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ left_version_id, right_version_id }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const left = noteByIdOrAlias(snapshot, left_version_id);
    const right = noteByIdOrAlias(snapshot, right_version_id);
    if (!left || !right || left.type !== "paper_version" || right.type !== "paper_version") throw new Error("Both approved paper versions must exist");
    const keys = new Set([...Object.keys(left.metadata), ...Object.keys(right.metadata)]);
    const changes = [...keys].filter((key) => JSON.stringify(left.metadata[key]) !== JSON.stringify(right.metadata[key])).map((key) => ({ key, left: left.metadata[key], right: right.metadata[key] }));
    return textResult({ left: publicNote(left, env.PUBLIC_BASE_URL, includeEvidence), right: publicNote(right, env.PUBLIC_BASE_URL, includeEvidence), changes, textChanged: left.body !== right.body });
  });

  server.registerTool("build_paper_context", {
    title: "Build paper context",
    description: "Build a bounded, evidence-aware context package for one paper and selected related types.",
    inputSchema: { paper_id: z.string().min(1).max(300), include_types: z.array(z.enum(["benchmark_use", "limitation_occurrence", "relation", "problem_framing", "claim"])).default(["benchmark_use", "limitation_occurrence", "relation"]), max_items: z.number().int().min(1).max(100).default(40) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ paper_id, include_types, max_items }) => {
    requireRead(scopes);
    const snapshot = await loadSnapshot(env);
    const paper = noteByIdOrAlias(snapshot, paper_id);
    if (!paper || paper.type !== "paper_work") throw new Error(`Unknown paper: ${paper_id}`);
    const versions = paperVersions(snapshot, paper);
    const ids = new Set(versions.map((note) => note.id));
    const candidates = include_types.flatMap((type) => notesByType(snapshot, type).filter((note) => ids.has(cleanLink(note.metadata.paper_version)) || ids.has(cleanLink(note.metadata.subject)) || ids.has(cleanLink(note.metadata.object))));
    const related = boundedItems(candidates, max_items);
    return textResult({ paper: publicNote(paper, env.PUBLIC_BASE_URL, includeEvidence), versions: versions.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)), related: related.items.map((note) => publicNote(note, env.PUBLIC_BASE_URL, includeEvidence)), truncated: related.truncated });
  });

  return server;
}
