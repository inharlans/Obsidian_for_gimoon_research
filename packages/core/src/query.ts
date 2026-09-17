import type { VaultNote } from "./markdown.js";

export interface PaperSummary {
  id: string;
  title: string;
  aliases: string[];
  firstPublicDate?: string;
  venue?: string;
  versions: string[];
  path: string;
}

export function exactResolve(notes: VaultNote[], query: string): VaultNote[] {
  const needle = query.trim().toLocaleLowerCase();
  return notes.filter((note) => {
    if (!note.data) return false;
    const external = Object.values((note.data.external_ids ?? {}) as Record<string, string>);
    return [note.data.id, note.data.title, note.basename, ...(note.data.aliases ?? []), ...external]
      .some((value) => String(value).toLocaleLowerCase() === needle);
  });
}

export function textRank(notes: VaultNote[], query: string): Array<{ note: VaultNote; score: number }> {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return notes.map((note) => {
    const title = String(note.data?.title ?? note.basename).toLocaleLowerCase();
    const aliases = (note.data?.aliases ?? []).join(" ").toLocaleLowerCase();
    const body = note.body.toLocaleLowerCase();
    const score = terms.reduce((total, term) => total + (title.includes(term) ? 12 : 0) + (aliases.includes(term) ? 8 : 0) + Math.min(5, body.split(term).length - 1), 0);
    return { note, score };
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.note.relativePath.localeCompare(b.note.relativePath));
}

export function noteToPaperSummary(note: VaultNote): PaperSummary {
  const fm = note.frontmatter;
  const value: PaperSummary = {
    id: String(fm.id), title: String(fm.title), aliases: Array.isArray(fm.aliases) ? fm.aliases.map(String) : [],
    versions: Array.isArray(fm.versions) ? fm.versions.map(String) : [], path: note.relativePath
  };
  if (fm.first_public_date) value.firstPublicDate = String(fm.first_public_date);
  if (fm.venue_event) value.venue = String(fm.venue_event);
  return value;
}

