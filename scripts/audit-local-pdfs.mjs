import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const root = path.resolve(process.argv[2] ?? "../PaperKG-Zotero-Attachments");
const output = process.argv[3] && path.resolve(process.argv[3]);
const files = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && /\.pdf$/i.test(entry.name)).map(entry => entry.name).sort();
const results = [];
for (const filename of files) {
  let task;
  try {
    const bytes = await readFile(path.join(root, filename));
    task = getDocument({ data: new Uint8Array(bytes), enableXfa: false, useWorkerFetch: false });
    const document = await task.promise;
    // Traverse the page tree to catch broken page references without rendering or executing scripts.
    for (let page = 1; page <= document.numPages; page++) await document.getPage(page);
    results.push({ filename, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), pages: document.numPages, readable: true });
  } catch (error) {
    results.push({ filename, readable: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (task) await task.destroy();
  }
}
const byHash = new Map();
for (const row of results) {
  if (row.sha256) byHash.set(row.sha256, [...(byHash.get(row.sha256) ?? []), row.filename]);
}
const report = {
  checked_at: new Date().toISOString(), root, files: results.length,
  unreadable: results.filter(row => !row.readable).length,
  total_pages: results.reduce((n, row) => n + (row.pages ?? 0), 0),
  duplicate_groups: [...byHash.values()].filter(group => group.length > 1), results
};
if (output) {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ ...report, results: output ? undefined : results, output }, null, 2));
if (!files.length || report.unreadable) process.exitCode = 1;
