#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import {
  approveProposal, applyProposal, loadProposal, makeProposal, parseFrontmatter,
  auditVault, importMeetingCandidateBundle, parseMarkdown, saveProposal, scanVault,
  setProposalStatus, validateVault, type PatchOperation
} from "@paperkg/core";
import {
  defaultDatabasePath, PaperKgIndex, rebuildIndex, searchWithoutIndex
} from "@paperkg/indexer";
import { parsePdf } from "@paperkg/ingestion";

const program = new Command();
program.name("paperkg").description("Validate, ingest, index, and query a PaperKG vault").version("0.1.0");

function vaultOption(command: Command): Command {
  return command.option("--vault <path>", "PaperKG vault root", "vault/PaperKG");
}

function json(value: unknown): void { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }

program.command("validate")
  .argument("<vault>")
  .option("--json", "print JSON")
  .action(async (vault: string, options: { json?: boolean }) => {
    const report = await validateVault(path.resolve(vault));
    if (options.json) json(report);
    else {
      console.log(`Validated ${report.notes} notes: ${report.errors} error(s), ${report.warnings} warning(s)`);
      for (const issue of report.issues) console.log(`${issue.severity.toUpperCase()} ${issue.code} ${issue.file}: ${issue.message}`);
    }
    if (report.errors > 0) process.exitCode = 1;
  });

program.command("audit")
  .argument("<vault>")
  .description("Measure semantic completeness without changing canonical notes")
  .option("--fail-on <priority>", "set exit code when findings at this priority or higher exist")
  .action(async (vault: string, options: { failOn?: string }) => {
    const report = await auditVault(path.resolve(vault));
    json(report);
    if (options.failOn) {
      const levels: Record<string, number> = { low: 1, medium: 2, high: 3 };
      const threshold = levels[options.failOn];
      if (!threshold) throw new Error("--fail-on must be low, medium, or high");
      if (report.findings.some((finding) => levels[finding.priority]! >= threshold)) process.exitCode = 1;
    }
  });

program.command("inspect")
  .argument("<note>")
  .option("--vault <path>", "vault root; defaults to note parent")
  .action(async (notePath: string, options: { vault?: string }) => {
    const absolute = path.resolve(notePath);
    const vault = path.resolve(options.vault ?? path.dirname(absolute));
    const note = parseMarkdown(await readFile(absolute, "utf8"), absolute, vault);
    note.data = parseFrontmatter(note.frontmatter);
    json({ path: note.relativePath, frontmatter: note.data, headings: note.headings, wikilinks: note.wikilinks, evidenceBlocks: note.evidenceBlockIds });
  });

vaultOption(program.command("index"))
  .option("--database <path>")
  .action(async (options: { vault: string; database?: string }) => json(await rebuildIndex(path.resolve(options.vault), options.database && path.resolve(options.database))));

vaultOption(program.command("search"))
  .argument("<query>")
  .option("--limit <number>", "maximum results", "20")
  .action(async (query: string, options: { vault: string; limit: string }) => {
    const vault = path.resolve(options.vault);
    const database = defaultDatabasePath(vault);
    try {
      const index = new PaperKgIndex(database);
      const exact = index.exact(query);
      const results = exact.length > 0 ? exact : index.search(query, Number(options.limit));
      json(results);
      index.close();
    } catch {
      json(await searchWithoutIndex(vault, query, Number(options.limit)));
    }
  });

vaultOption(program.command("get"))
  .argument("<id>")
  .action(async (id: string, options: { vault: string }) => withIndex(options.vault, (index) => index.get(id)));

vaultOption(program.command("benchmark-usage"))
  .argument("<benchmark>")
  .action(async (benchmark: string, options: { vault: string }) => withIndex(options.vault, (index) => index.notesByType("benchmark_use").filter((note) => String(note.frontmatter.benchmark).toLocaleLowerCase().includes(benchmark.toLocaleLowerCase()))));

vaultOption(program.command("benchmark-comparison"))
  .argument("<benchmark>")
  .action(async (benchmark: string, options: { vault: string }) => withIndex(options.vault, (index) => {
    const uses = index.notesByType("benchmark_use").filter((note) => String(note.frontmatter.benchmark).toLocaleLowerCase().includes(benchmark.toLocaleLowerCase()));
    const useIds = new Set(uses.map((note) => note.id));
    return {
      benchmark,
      uses,
      assessments: index.notesByType("comparison_assessment").filter((note) => useIds.has(String(note.frontmatter.left_use).replace(/^\[\[|\]\]$/g, "")) && useIds.has(String(note.frontmatter.right_use).replace(/^\[\[|\]\]$/g, ""))),
      resultRows: uses.flatMap((note) => index.resultRows(note.id))
    };
  }));

vaultOption(program.command("trace-problem"))
  .argument("<problem>")
  .action(async (problem: string, options: { vault: string }) => withIndex(options.vault, (index) => {
    const normalized = (value: unknown) => String(value ?? "").replace(/^\[\[|\]\]$/g, "").split("#")[0]!.toLocaleLowerCase();
    const problemNote = index.exact(problem).find((note) => note.type === "problem");
    const candidates = new Set([normalized(problem), normalized(problemNote?.id), normalized(problemNote?.title)].filter(Boolean));
    const framings = index.notesByType("problem_framing").filter((note) => candidates.has(normalized(note.frontmatter.problem)));
    const versionIds = new Set(framings.map((note) => normalized(note.frontmatter.paper_version)).filter(Boolean));
    const relevantIds = new Set([...candidates, ...framings.map((note) => normalized(note.id)), ...versionIds]);
    const evolutionPredicates = new Set(["addresses", "partially_addresses", "leaves_open", "reframes", "reopens", "inherits_problem", "introduces_problem", "chronologically_after"]);
    const relations = index.notesByType("relation").filter((note) =>
      evolutionPredicates.has(String(note.frontmatter.predicate))
      && (relevantIds.has(normalized(note.frontmatter.subject)) || relevantIds.has(normalized(note.frontmatter.object)))
    );
    return {
      problem: problemNote ?? null,
      framings: framings.map((frame) => ({ frame, paperVersion: index.get(normalized(frame.frontmatter.paper_version)) ?? null })),
      relations
    };
  }));

vaultOption(program.command("shared-limitations"))
  .argument("<limitation>")
  .action(async (limitation: string, options: { vault: string }) => withIndex(options.vault, (index) => index.notesByType("limitation_occurrence").filter((note) => String(note.frontmatter.limitation).toLocaleLowerCase().includes(limitation.toLocaleLowerCase()))));

vaultOption(program.command("compare"))
  .argument("<paperIds...>")
  .action(async (paperIds: string[], options: { vault: string }) => withIndex(options.vault, (index) => paperIds.map((id) => {
    const paper = index.get(id);
    if (!paper) return { id, missing: true };
    const versionLinks = Array.isArray(paper.frontmatter.versions) ? paper.frontmatter.versions.map(String) : [];
    const versions = versionLinks.flatMap((link) => index.exact(link.replace(/^\[\[|\]\]$/g, "")));
    const versionIds = new Set(versions.map((version) => version.id));
    const benchmarkUses = index.notesByType("benchmark_use").filter((use) => [...versionIds].some((versionId) => String(use.frontmatter.paper_version).includes(versionId)));
    const useIds = new Set(benchmarkUses.map((use) => use.id));
    return {
      paper, versions,
      contributions: index.notesByType("contribution").filter((note) => versionIds.has(String(note.frontmatter.paper_version).replace(/^\[\[|\]\]$/g, ""))),
      claims: index.notesByType("claim").filter((note) => versionIds.has(String(note.frontmatter.paper_version).replace(/^\[\[|\]\]$/g, ""))),
      methods: index.notesByType("method").filter((note) => versionIds.has(String(note.frontmatter.introduced_by).replace(/^\[\[|\]\]$/g, ""))),
      benchmarkUses,
      resultSets: index.notesByType("result_set").filter((note) => versionIds.has(String(note.frontmatter.paper_version).replace(/^\[\[|\]\]$/g, ""))),
      comparisonAssessments: index.notesByType("comparison_assessment").filter((note) => useIds.has(String(note.frontmatter.left_use).replace(/^\[\[|\]\]$/g, "")) || useIds.has(String(note.frontmatter.right_use).replace(/^\[\[|\]\]$/g, ""))),
      limitations: index.notesByType("limitation_occurrence").filter((occurrence) => [...versionIds].some((versionId) => String(occurrence.frontmatter.paper_version).includes(versionId)))
    };
  })));

vaultOption(program.command("version-diff"))
  .argument("<left>")
  .argument("<right>")
  .action(async (left: string, right: string, options: { vault: string }) => withIndex(options.vault, (index) => {
    const a = index.get(left); const b = index.get(right);
    if (!a || !b) throw new Error("Both version IDs must exist");
    const keys = new Set([...Object.keys(a.frontmatter), ...Object.keys(b.frontmatter)]);
    return { left: a.id, right: b.id, fields: [...keys].filter((key) => JSON.stringify(a.frontmatter[key]) !== JSON.stringify(b.frontmatter[key])).map((key) => ({ key, left: a.frontmatter[key], right: b.frontmatter[key] })) };
  }));

vaultOption(program.command("ingest-pdf"))
  .argument("<pdf>")
  .action(async (pdf: string, options: { vault: string }) => json(await parsePdf(pdf, path.resolve(options.vault))));

const meeting = program.command("meeting");
vaultOption(meeting.command("sync-bundle"))
  .argument("<bundleJson>")
  .description("Import a remote meeting candidate bundle and create a deterministic local promotion proposal")
  .action(async (bundleJson: string, options: { vault: string }) => {
    const bundle = JSON.parse(await readFile(path.resolve(bundleJson), "utf8")) as unknown;
    json(await importMeetingCandidateBundle({ vaultRoot: path.resolve(options.vault), bundle }));
  });

const proposal = program.command("proposal");
vaultOption(proposal.command("create"))
  .argument("<candidateJson>")
  .action(async (candidateJson: string, options: { vault: string }) => {
    const input = JSON.parse(await readFile(path.resolve(candidateJson), "utf8")) as { rationale?: string; operations: PatchOperation[] };
    const created = makeProposal({ createdBy: "codex", rationale: input.rationale ?? "Codex paper extraction proposal", operations: input.operations });
    const saved = await saveProposal(path.resolve(options.vault), created);
    json({ proposal: created, saved });
  });

vaultOption(proposal.command("show"))
  .argument("<id>")
  .action(async (id: string, options: { vault: string }) => json(await loadProposal(path.resolve(options.vault), id)));

vaultOption(proposal.command("approve"))
  .argument("<id>")
  .action(async (id: string, options: { vault: string }) => {
    const vault = path.resolve(options.vault);
    const value = await loadProposal(vault, id);
    const token = await approveProposal(vault, value);
    json({ proposalId: id, token, expiresInMinutes: 15, warning: "This single-use local approval token is not generated by MCP." });
  });

vaultOption(proposal.command("apply"))
  .argument("<id>")
  .requiredOption("--token <token>")
  .action(async (id: string, options: { vault: string; token: string }) => {
    const vault = path.resolve(options.vault);
    const value = await loadProposal(vault, id);
    for (const operation of value.operations) {
      const parsed = parseMarkdown(operation.content, path.join(vault, operation.path), vault);
      parseFrontmatter(parsed.frontmatter);
    }
    await applyProposal(vault, value, options.token);
    await setProposalStatus(vault, id, "applied");
    const report = await validateVault(vault);
    json({ applied: id, validation: report });
    if (report.errors > 0) process.exitCode = 1;
  });

async function withIndex<T>(vaultInput: string, action: (index: PaperKgIndex) => T): Promise<void> {
  const vault = path.resolve(vaultInput);
  const database = defaultDatabasePath(vault);
  try { new PaperKgIndex(database).close(); } catch { await rebuildIndex(vault, database); }
  const index = new PaperKgIndex(database);
  try { json(action(index)); } finally { index.close(); }
}

await program.parseAsync(process.argv);
