import { sha256 } from "@paperkg/core";

export interface IdentityCandidate {
  id?: string;
  title: string;
  firstAuthor?: string;
  year?: number;
  abstract?: string;
  externalIds?: Record<string, string | undefined>;
  pdfSha256?: string;
}

export interface IdentityMatch {
  candidate: IdentityCandidate;
  strength: "strong" | "weak";
  reasons: string[];
  score: number;
}

export function normalizeTitle(title: string): string {
  return title.normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function tokens(text: string): Set<string> {
  return new Set(normalizeTitle(text).split(/\s+/).filter((value) => value.length > 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function findIdentityMatches(incoming: IdentityCandidate, existing: IdentityCandidate[]): IdentityMatch[] {
  const matches: IdentityMatch[] = [];
  for (const candidate of existing) {
    const reasons: string[] = [];
    let strong = false;
    for (const kind of ["doi", "arxiv", "openreview"] as const) {
      const left = incoming.externalIds?.[kind]?.toLocaleLowerCase();
      const right = candidate.externalIds?.[kind]?.toLocaleLowerCase();
      if (left && right && left === right) { reasons.push(`same ${kind}`); strong = true; }
    }
    if (incoming.pdfSha256 && candidate.pdfSha256 && incoming.pdfSha256 === candidate.pdfSha256) {
      reasons.push("same PDF SHA-256"); strong = true;
    }
    const titleScore = jaccard(tokens(incoming.title), tokens(candidate.title));
    const author = incoming.firstAuthor && candidate.firstAuthor && normalizeTitle(incoming.firstAuthor) === normalizeTitle(candidate.firstAuthor);
    const yearClose = incoming.year && candidate.year ? Math.abs(incoming.year - candidate.year) <= 1 : false;
    const abstractHash = incoming.abstract && candidate.abstract ? sha256(normalizeTitle(incoming.abstract)).slice(0, 16) === sha256(normalizeTitle(candidate.abstract)).slice(0, 16) : false;
    if (titleScore >= 0.85) reasons.push(`title similarity ${titleScore.toFixed(2)}`);
    if (author) reasons.push("same first author");
    if (yearClose) reasons.push("publication window within one year");
    if (abstractHash) reasons.push("same abstract fingerprint");
    const score = strong ? 1 : titleScore * 0.65 + (author ? 0.2 : 0) + (yearClose ? 0.05 : 0) + (abstractHash ? 0.1 : 0);
    if (strong || score >= 0.72) matches.push({ candidate, strength: strong ? "strong" : "weak", reasons, score });
  }
  return matches.sort((a, b) => b.score - a.score);
}

