import { readFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import YAML from "yaml";
import type { NoteFrontmatter } from "./schema.js";
import { parseFrontmatter } from "./schema.js";

export interface VaultNote {
  absolutePath: string;
  relativePath: string;
  basename: string;
  frontmatter: Record<string, unknown>;
  data?: NoteFrontmatter;
  body: string;
  headings: string[];
  wikilinks: string[];
  evidenceBlockIds: string[];
  resultSetBlocks: Array<{ raw: string; value?: unknown; error?: string }>;
  parseError?: string;
}

export function normalizeWikilink(value: string): string {
  return value.replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0]!.split("#")[0]!.trim();
}

export function extractWikilinks(text: string): string[] {
  const links: string[] = [];
  for (const match of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
    if (match[1]) links.push(match[1]);
  }
  return [...new Set(links)];
}

export function extractResultSetBlocks(text: string): Array<{ raw: string; value?: unknown; error?: string }> {
  return [...text.matchAll(/```paperkg-resultset\s*\r?\n([\s\S]*?)```/g)].map((match) => {
    const raw = match[1]?.trim() ?? "";
    try {
      return { raw, value: YAML.parse(raw) as unknown };
    } catch (error) {
      return { raw, error: error instanceof Error ? error.message : String(error) };
    }
  });
}

export function parseMarkdown(source: string, absolutePath: string, vaultRoot: string): VaultNote {
  const parsed = matter(source);
  const body = parsed.content;
  const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1]!.trim());
  const wikilinkSource = `${JSON.stringify(parsed.data)}\n${body}`;
  const evidenceBlockIds = [...body.matchAll(/^\^(ev_[A-Za-z0-9_-]+)$/gm)].map((m) => m[1]!);
  return {
    absolutePath,
    relativePath: path.relative(vaultRoot, absolutePath).replaceAll("\\", "/"),
    basename: path.basename(absolutePath, path.extname(absolutePath)),
    frontmatter: parsed.data as Record<string, unknown>,
    body,
    headings,
    wikilinks: extractWikilinks(wikilinkSource),
    evidenceBlockIds,
    resultSetBlocks: extractResultSetBlocks(body)
  };
}

export async function scanVault(vaultRoot: string): Promise<VaultNote[]> {
  const files = await fg("**/*.md", {
    cwd: vaultRoot,
    absolute: true,
    dot: false,
    ignore: [
      ".obsidian/**", ".paperkg/**", "node_modules/**", "Attachments/**",
      "00_System/**", "09_Views/**", "10_Inbox/**", "README.md"
    ]
  });
  const notes: VaultNote[] = [];
  for (const file of files.sort()) {
    try {
      const note = parseMarkdown(await readFile(file, "utf8"), file, vaultRoot);
      try { note.data = parseFrontmatter(note.frontmatter); } catch { /* Validation reports schema details. */ }
      notes.push(note);
    } catch (error) {
      notes.push({
        absolutePath: file,
        relativePath: path.relative(vaultRoot, file).replaceAll("\\", "/"),
        basename: path.basename(file, path.extname(file)),
        frontmatter: {}, body: "", headings: [], wikilinks: [], evidenceBlockIds: [], resultSetBlocks: [],
        parseError: error instanceof Error ? error.message : String(error)
      });
    }
  }
  return notes;
}
