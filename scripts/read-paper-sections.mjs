import fs from "node:fs";
import path from "node:path";

const [input, patternSource = "", contextSource = "0", maxCharsSource = "12000"] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node scripts/read-paper-sections.mjs <pages.json> [regex] [context-pages] [max-chars]");
  process.exit(2);
}

const parsed = JSON.parse(fs.readFileSync(input, "utf8"));
const patterns = patternSource
  ? new RegExp(patternSource, "i")
  : /abstract|introduction|experiment|evaluation|limitation|conclusion/i;
const contextPages = Number.parseInt(contextSource, 10) || 0;
const maxChars = Number.parseInt(maxCharsSource, 10) || 12000;
const selected = new Set([1]);

for (const page of parsed.pages) {
  if (!patterns.test(page.text)) continue;
  for (let offset = -contextPages; offset <= contextPages; offset += 1) {
    const candidate = page.page + offset;
    if (candidate >= 1 && candidate <= parsed.pages.length) selected.add(candidate);
  }
}

console.log(`SOURCE ${path.basename(input)} | SHA256 ${parsed.sha256} | PAGES ${parsed.pages.length}`);
for (const pageNumber of [...selected].sort((a, b) => a - b)) {
  const page = parsed.pages.find((entry) => entry.page === pageNumber);
  if (!page) continue;
  console.log(`\n===== PAGE ${page.page} =====\n`);
  console.log(page.text.slice(0, maxChars));
}
