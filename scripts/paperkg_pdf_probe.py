"""PDF probes for the paper translation pipeline.

Two jobs, both needed by scripts/translate-paper.ps1:

  refpage <pdf>      print the 1-based page where the reference list starts,
                     or 0 when no heading is found. The pipeline translates
                     only the pages before it.

  hangul <pdf> <n>   print one line per page with Hangul/Latin counts for the
                     first n pages, then "FAIL <pages>" if any of those pages
                     came back essentially untranslated.

Do not rename this file to anything that shadows a stdlib module (inspect.py,
types.py, ...). PyMuPDF imports stdlib `inspect` on load, and a sibling script
with that name breaks it with a confusing circular-import error.
"""

import re
import sys

import pymupdf

REF_HEADING = re.compile(r"(?i)^[\dIVX]*\.?\s*(references|bibliography|참고\s*문헌)\s*$")
HANGUL = re.compile(r"[가-힣]")
LATIN = re.compile(r"[A-Za-z]")

# A translated page that still has almost no Hangul means DeepL dropped that
# chunk (usually a rate-limit that exhausted its retries). Figure/table-heavy
# pages legitimately sit low, so this is a floor, not a ratio.
MIN_HANGUL_PER_PAGE = 100


def find_reference_page(path: str) -> int:
    with pymupdf.open(path) as doc:
        for index in range(doc.page_count):
            for line in doc[index].get_text().split("\n"):
                if REF_HEADING.match(line.strip()):
                    return index + 1
    return 0


def report_hangul(path: str, limit: int) -> int:
    failed = []
    with pymupdf.open(path) as doc:
        pages = min(limit, doc.page_count) if limit > 0 else doc.page_count
        for index in range(pages):
            text = doc[index].get_text()
            han = len(HANGUL.findall(text))
            lat = len(LATIN.findall(text))
            ratio = han / max(han + lat, 1)
            print("page %-3d hangul %-6d latin %-6d ratio %.2f" % (index + 1, han, lat, ratio))
            if han < MIN_HANGUL_PER_PAGE:
                failed.append(index + 1)
    if failed:
        print("FAIL %s" % ",".join(str(p) for p in failed))
        return 1
    print("OK")
    return 0


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    command, path = sys.argv[1], sys.argv[2]
    if command == "refpage":
        print(find_reference_page(path))
        return 0
    if command == "hangul":
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        return report_hangul(path, limit)
    print("unknown command: %s" % command)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
