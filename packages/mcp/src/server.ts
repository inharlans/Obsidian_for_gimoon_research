import { existsSync } from "node:fs";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { defaultDatabasePath, PaperKgIndex, rebuildIndex, type IndexedNote } from "@paperkg/indexer";

export interface PaperKgServerOptions {
  vaultRoot: string;
  publicBaseUrl?: string;
  includeEvidence?: boolean;
}

function cleanLink(value: unknown): string {
  return String(value ?? "").replace(/^\[\[/, "").replace(/\]\]$/, "").split("#")[0]!;
}

function noteUrl(note: IndexedNote, options: PaperKgServerOptions): string {
  if (options.publicBaseUrl) return `${options.publicBaseUrl.replace(/\/$/, "")}/notes/${encodeURIComponent(note.id)}`;
  return `obsidian://open?vault=${encodeURIComponent(path.basename(options.vaultRoot))}&file=${encodeURIComponent(note.path.replace(/\.md$/i, ""))}`;
}

function contentResult(value: unknown) {
  return { structuredContent: value as Record<string, unknown>, content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function isApproved(note: IndexedNote | undefined): note is IndexedNote {
  const status = note?.frontmatter.curation_status;
  return Boolean(note && (status === "reviewed" || status === "verified"));
}

function approvedExact(index: PaperKgIndex, query: string): IndexedNote[] {
  return index.exact(query).filter(isApproved);
}

function approvedType(index: PaperKgIndex, type: string): IndexedNote[] {
  return index.notesByType(type).filter(isApproved);
}

function approvedEdges(edges: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return edges.filter((edge) => edge.status === "reviewed" || edge.status === "verified");
}

function remoteMetadata(frontmatter: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...frontmatter };
  for (const key of ["source_path", "local_path", "submitted_by_sha256", "idempotency_key_sha256"]) delete copy[key];
  return copy;
}

function conciseNote(note: IndexedNote, options: PaperKgServerOptions) {
  return {
    id: note.id, title: note.title, type: note.type, url: noteUrl(note, options),
    metadata: remoteMetadata(note.frontmatter),
    text: options.includeEvidence ? note.body : approvedSummary(note.body)
  };
}

function approvedSummary(body: string): string {
  const withoutEvidenceQuotes = body.replace(/^> \[!evidence\][\s\S]*?(?=\n\n|$)/gm, "[Evidence omitted from remote profile]");
  return withoutEvidenceQuotes.slice(0, 12_000);
}

export async function createPaperKgServer(options: PaperKgServerOptions): Promise<McpServer> {
  const databasePath = defaultDatabasePath(options.vaultRoot);
  if (!existsSync(databasePath)) await rebuildIndex(options.vaultRoot, databasePath);

  const server = new McpServer(
    { name: "paperkg", version: "0.1.0" },
    { instructions: "PaperKG is an evidence-grounded scholarly knowledge source. Resolve exact paper aliases before fuzzy search. Never compare scores unless BenchmarkUse comparability is exact. Treat curator interpretation separately from author statements. All tools are read-only; canonical changes require local proposal review." }
  );

  const open = () => new PaperKgIndex(databasePath);

  server.registerTool("search", {
    title: "Search PaperKG",
    description: "Use this when the user wants to find papers or approved scholarly knowledge in the PaperKG vault.",
    inputSchema: { query: z.string().min(1).max(500) },
    outputSchema: { results: z.array(z.object({ id: z.string(), title: z.string(), url: z.string() })) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ query }) => {
    const index = open();
    try {
      const exact = approvedExact(index, query);
      const source = exact.length > 0 ? exact : index.search(query, 60).map((result) => index.get(result.id)).filter(isApproved).slice(0, 20);
      const results = source.map((note) => ({ id: note.id, title: note.title, url: noteUrl(note, options) }));
      return contentResult({ results });
    } finally { index.close(); }
  });

  server.registerTool("fetch", {
    title: "Fetch a PaperKG item",
    description: "Use this when the user selected a PaperKG search result and needs its approved content and metadata.",
    inputSchema: { id: z.string().min(1).max(300) },
    outputSchema: { id: z.string(), title: z.string(), text: z.string(), url: z.string(), metadata: z.record(z.unknown()).optional() },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ id }) => {
    const index = open();
    try {
      const note = index.get(id);
      if (!isApproved(note)) throw new Error(`Unknown PaperKG item: ${id}`);
      return contentResult(conciseNote(note, options));
    } finally { index.close(); }
  });

  server.registerTool("search_papers", {
    title: "Search papers",
    description: "Use this when the user wants paper works matching a title, alias, identifier, venue, topic, or text query.",
    inputSchema: { query: z.string().min(1).max(500), limit: z.number().int().min(1).max(50).default(20) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ query, limit }) => {
    const index = open();
    try {
      const exact = approvedExact(index, query).filter((note) => note.type === "paper_work");
      const results = (exact.length ? exact : index.search(query, Math.min(limit * 4, 100)).map((hit) => index.get(hit.id)).filter((note): note is IndexedNote => isApproved(note) && note.type === "paper_work").slice(0, limit))
        .map((note) => conciseNote(note, options));
      return contentResult({ results });
    } finally { index.close(); }
  });

  server.registerTool("get_paper", {
    title: "Get a paper",
    description: "Use this when the user wants one paper work, its versions, benchmark uses, limitations, and typed relations.",
    inputSchema: { paper_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ paper_id }) => {
    const index = open();
    try {
      const paperCandidate = index.get(paper_id) ?? approvedExact(index, paper_id)[0];
      if (!isApproved(paperCandidate) || paperCandidate.type !== "paper_work") throw new Error(`Unknown paper: ${paper_id}`);
      const paper = paperCandidate;
      const versions = (Array.isArray(paper.frontmatter.versions) ? paper.frontmatter.versions : []).flatMap((link) => approvedExact(index, cleanLink(link)));
      const versionIds = new Set(versions.map((note) => note.id));
      const benchmarkUses = approvedType(index, "benchmark_use").filter((note) => versionIds.has(cleanLink(note.frontmatter.paper_version)));
      const limitations = approvedType(index, "limitation_occurrence").filter((note) => versionIds.has(cleanLink(note.frontmatter.paper_version)));
      return contentResult({ paper: conciseNote(paper, options), versions: versions.map((note) => conciseNote(note, options)), benchmarkUses, limitations });
    } finally { index.close(); }
  });

  server.registerTool("get_entity", {
    title: "Get a scholarly entity",
    description: "Use this when the user wants an exact PaperKG problem, method, benchmark, claim, limitation, relation, or other entity.",
    inputSchema: { entity_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ entity_id }) => {
    const index = open();
    try {
      const note = index.get(entity_id) ?? approvedExact(index, entity_id)[0];
      if (!isApproved(note)) throw new Error(`Unknown entity: ${entity_id}`);
      return contentResult({ entity: conciseNote(note, options), outgoing: approvedEdges(index.outgoing(note.id)), incoming: approvedEdges(index.incoming(note.id)) });
    } finally { index.close(); }
  });

  server.registerTool("get_benchmark_usage", {
    title: "Get benchmark usage",
    description: "Use this when the user wants every paper use of a benchmark, including purpose, protocol, metrics, results, and comparability.",
    inputSchema: { benchmark_id: z.string().min(1), include_results: z.boolean().default(true) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ benchmark_id, include_results }) => {
    const index = open();
    try {
      const uses = approvedType(index, "benchmark_use").filter((note) => cleanLink(note.frontmatter.benchmark).toLocaleLowerCase().includes(benchmark_id.toLocaleLowerCase()));
      const useIds = new Set(uses.map((note) => note.id));
      const assessments = approvedType(index, "comparison_assessment").filter((note) => useIds.has(cleanLink(note.frontmatter.left_use)) && useIds.has(cleanLink(note.frontmatter.right_use)));
      return contentResult({
        benchmarkId: benchmark_id,
        uses: uses.map((note) => include_results ? note : { ...note, frontmatter: { ...note.frontmatter, result_sets: [] } }),
        assessments,
        resultRows: include_results ? uses.flatMap((note) => index.resultRows(note.id)) : []
      });
    } finally { index.close(); }
  });

  server.registerTool("compare_papers", {
    title: "Compare papers",
    description: "Use this when the user wants an evidence-aware comparison of two to ten papers. Do not rank non-comparable benchmark scores.",
    inputSchema: { paper_ids: z.array(z.string()).min(2).max(10), profile: z.string().default("universal"), include_evidence: z.boolean().default(false) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ paper_ids, profile, include_evidence }) => {
    const index = open();
    try {
      const papers = paper_ids.map((id) => index.get(id) ?? approvedExact(index, id)[0]).filter(isApproved);
      const result = papers.map((paper) => {
        const versions = (Array.isArray(paper.frontmatter.versions) ? paper.frontmatter.versions : []).flatMap((link) => approvedExact(index, cleanLink(link)));
        const ids = new Set(versions.map((note) => note.id));
        return {
          paper: conciseNote(paper, { ...options, includeEvidence: Boolean(include_evidence && options.includeEvidence) }), versions,
          contributions: approvedType(index, "contribution").filter((note) => ids.has(cleanLink(note.frontmatter.paper_version))),
          claims: approvedType(index, "claim").filter((note) => ids.has(cleanLink(note.frontmatter.paper_version))),
          methods: approvedType(index, "method").filter((note) => ids.has(cleanLink(note.frontmatter.introduced_by))),
          benchmarkUses: approvedType(index, "benchmark_use").filter((note) => ids.has(cleanLink(note.frontmatter.paper_version))),
          resultSets: approvedType(index, "result_set").filter((note) => ids.has(cleanLink(note.frontmatter.paper_version))),
          limitations: approvedType(index, "limitation_occurrence").filter((note) => ids.has(cleanLink(note.frontmatter.paper_version)))
        };
      });
      const useIds = new Set(result.flatMap((entry) => entry.benchmarkUses.map((note) => note.id)));
      const assessments = approvedType(index, "comparison_assessment").filter((note) => useIds.has(cleanLink(note.frontmatter.left_use)) && useIds.has(cleanLink(note.frontmatter.right_use)));
      return contentResult({ profile, warning: "Rank scores only when a pairwise ComparisonAssessment is exact; otherwise explain the recorded protocol differences.", papers: result, assessments });
    } finally { index.close(); }
  });

  server.registerTool("trace_problem_evolution", {
    title: "Trace problem evolution",
    description: "Use this when the user wants a chronological, evidence-backed trace of how papers frame, reframe, address, or leave a research problem open.",
    inputSchema: { problem_id: z.string().min(1), date_basis: z.enum(["first_public_date", "venue_event_date"]).default("first_public_date") },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ problem_id, date_basis }) => {
    const index = open();
    try {
      const problem = approvedExact(index, problem_id).find((note) => note.type === "problem");
      const candidates = new Set([problem_id, problem?.id, problem?.title].filter((value): value is string => Boolean(value)).map((value) => value.toLocaleLowerCase()));
      const framings = approvedType(index, "problem_framing").filter((note) => candidates.has(cleanLink(note.frontmatter.problem).toLocaleLowerCase()));
      const versionIds = new Set(framings.map((note) => cleanLink(note.frontmatter.paper_version)));
      const relevantIds = new Set([...candidates, ...framings.map((note) => note.id.toLocaleLowerCase()), ...[...versionIds].map((id) => id.toLocaleLowerCase())]);
      const predicates = new Set(["addresses", "partially_addresses", "leaves_open", "reframes", "reopens", "inherits_problem", "introduces_problem", "chronologically_after"]);
      const relations = approvedType(index, "relation").filter((note) => predicates.has(String(note.frontmatter.predicate)) && (
        relevantIds.has(cleanLink(note.frontmatter.subject).toLocaleLowerCase()) || relevantIds.has(cleanLink(note.frontmatter.object).toLocaleLowerCase())
      ));
      return contentResult({
        problem: problem ? conciseNote(problem, options) : null,
        problemId: problem?.id ?? problem_id,
        dateBasis: date_basis,
        framings: framings.map((framing) => ({ framing: conciseNote(framing, options), paperVersion: approvedExact(index, cleanLink(framing.frontmatter.paper_version))[0] ? conciseNote(approvedExact(index, cleanLink(framing.frontmatter.paper_version))[0]!, options) : null })),
        relations: relations.map((note) => conciseNote(note, options))
      });
    } finally { index.close(); }
  });

  server.registerTool("find_shared_limitations", {
    title: "Find shared limitations",
    description: "Use this when the user wants papers sharing a normalized limitation and each version-specific occurrence and provenance.",
    inputSchema: { limitation_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ limitation_id }) => {
    const index = open();
    try {
      const occurrences = approvedType(index, "limitation_occurrence").filter((note) => cleanLink(note.frontmatter.limitation).toLocaleLowerCase().includes(limitation_id.toLocaleLowerCase()));
      return contentResult({ limitationId: limitation_id, occurrences });
    } finally { index.close(); }
  });

  server.registerTool("get_claim_evidence", {
    title: "Get claim evidence",
    description: "Use this when the user wants the approved evidence and typed relations supporting, qualifying, or contradicting a claim.",
    inputSchema: { claim_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ claim_id }) => {
    const index = open();
    try {
      const claim = index.get(claim_id) ?? approvedExact(index, claim_id)[0];
      if (!isApproved(claim)) throw new Error(`Unknown claim: ${claim_id}`);
      const evidenceRefs = Array.isArray(claim.frontmatter.evidence_refs) ? claim.frontmatter.evidence_refs.map(cleanLink) : [];
      const evidence = options.includeEvidence ? evidenceRefs.flatMap((id) => approvedExact(index, id)).map((note) => conciseNote(note, options)) : [];
      return contentResult({ claim: conciseNote(claim, options), evidence, outgoing: approvedEdges(index.outgoing(claim.id)), incoming: approvedEdges(index.incoming(claim.id)), evidencePolicy: options.includeEvidence ? "included" : "metadata-only" });
    } finally { index.close(); }
  });

  server.registerTool("get_version_diff", {
    title: "Get paper version diff",
    description: "Use this when the user wants metadata and structured-section differences between two versions of a paper.",
    inputSchema: { left_version_id: z.string().min(1), right_version_id: z.string().min(1) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ left_version_id, right_version_id }) => {
    const index = open();
    try {
      const left = index.get(left_version_id); const right = index.get(right_version_id);
      if (!isApproved(left) || !isApproved(right)) throw new Error("Both approved paper versions must exist");
      const keys = new Set([...Object.keys(left.frontmatter), ...Object.keys(right.frontmatter)]);
      const changes = [...keys].filter((key) => JSON.stringify(left.frontmatter[key]) !== JSON.stringify(right.frontmatter[key])).map((key) => ({ key, left: left.frontmatter[key], right: right.frontmatter[key] }));
      return contentResult({ left: conciseNote(left, options), right: conciseNote(right, options), changes });
    } finally { index.close(); }
  });

  server.registerTool("build_paper_context", {
    title: "Build paper context",
    description: "Use this when the model needs a bounded evidence-aware context package for one paper and selected related entity types.",
    inputSchema: { paper_id: z.string().min(1), include_types: z.array(z.enum(["benchmark_use", "limitation_occurrence", "relation", "problem_framing", "claim"])).default(["benchmark_use", "limitation_occurrence", "relation"]), max_items: z.number().int().min(1).max(100).default(40) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ paper_id, include_types, max_items }) => {
    const index = open();
    try {
      const paper = index.get(paper_id) ?? approvedExact(index, paper_id)[0];
      if (!isApproved(paper)) throw new Error(`Unknown paper: ${paper_id}`);
      const versions = (Array.isArray(paper.frontmatter.versions) ? paper.frontmatter.versions : []).flatMap((link) => approvedExact(index, cleanLink(link)));
      const versionIds = new Set(versions.map((note) => note.id));
      const related = include_types.flatMap((type) => approvedType(index, type).filter((note) => versionIds.has(cleanLink(note.frontmatter.paper_version)) || versionIds.has(cleanLink(note.frontmatter.subject)) || versionIds.has(cleanLink(note.frontmatter.object)))).slice(0, max_items);
      return contentResult({ paper: conciseNote(paper, options), versions: versions.map((note) => conciseNote(note, options)), related, truncated: related.length >= max_items });
    } finally { index.close(); }
  });

  return server;
}
