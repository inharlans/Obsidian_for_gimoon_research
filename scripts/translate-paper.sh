#!/usr/bin/env bash
# Translate a paper to Korean with DeepL and file it under the Zotero
# linked-attachment root. Linux/WSL twin of translate-paper.ps1.
#
# This exists because Codex runs inside WSL and its sandbox cannot invoke
# powershell.exe at all (WSL interop fails with UtilBindVsockAnyPort). The
# PowerShell version stays for interactive Windows use; this one is what an
# agent in WSL can actually run.
#
# Usage:
#   translate-paper.sh --source 2602.02007 --author Hu --year 2026 \
#       --title "Beyond RAG for Agent Memory: Retrieval by Decoupling and Aggregation"
#
#   --source     arXiv id, URL, or path to a local PDF
#   --dest       output directory (default: Zotero's attachment base directory)
#   --pages      override page range (default: everything before the references)
#   --force      overwrite files that already exist

set -euo pipefail

# pdf2zh-next (BabelDOC engine), the same engine as the rest of the library.
# Its babeldoc package needs pdf2zh-tool/patch-babeldoc.py, or extracted text
# loses every space.
VENV="$HOME/.local/share/pdf2zh-next-venv"
PYTHON="$VENV/bin/python"
PDF2ZH="$VENV/bin/pdf2zh_next"
PROBE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/paperkg_pdf_probe.py"
DEEPL_CONFIG="/mnt/c/Users/user/.config/PDFMathTranslate/config.json"
ZOTERO_PROFILE="/mnt/c/Users/user/AppData/Roaming/Zotero/Zotero/Profiles/zno9k7cs.default"
WORKDIR="${TMPDIR:-/tmp}/paperkg-translate.$$"

SOURCE=""; AUTHOR=""; YEAR=""; TITLE=""; DEST=""; PAGES=""; FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="$2"; shift 2 ;;
    --author) AUTHOR="$2"; shift 2 ;;
    --year)   YEAR="$2";   shift 2 ;;
    --title)  TITLE="$2";  shift 2 ;;
    --dest)   DEST="$2";   shift 2 ;;
    --pages)  PAGES="$2";  shift 2 ;;
    --force)  FORCE=1;     shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

for required in SOURCE AUTHOR YEAR TITLE; do
  if [[ -z "${!required}" ]]; then
    echo "missing --${required,,}" >&2
    exit 2
  fi
done

for dep in "$PYTHON" "$PDF2ZH" "$PROBE"; do
  [[ -e "$dep" ]] || { echo "missing dependency: $dep" >&2; exit 1; }
done

trap 'rm -rf "$WORKDIR"' EXIT
mkdir -p "$WORKDIR"

# --- DeepL key -------------------------------------------------------------
# The key lives in the old PDFMathTranslate config; hand it to pdf2zh-next via
# its PDF2ZH_ environment prefix so it never appears on a command line.
[[ -f "$DEEPL_CONFIG" ]] || { echo "missing DeepL config: $DEEPL_CONFIG" >&2; exit 1; }
DEEPL_AUTH_KEY="$("$PYTHON" - "$DEEPL_CONFIG" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1], encoding="utf-8"))
for t in cfg.get("translators", []):
    if t.get("name") == "deepl":
        print(t.get("envs", {}).get("DEEPL_AUTH_KEY", ""))
        break
PY
)"
[[ -n "$DEEPL_AUTH_KEY" ]] || { echo "DEEPL_AUTH_KEY not set in $DEEPL_CONFIG" >&2; exit 1; }
export PDF2ZH_DEEPL_AUTH_KEY="$DEEPL_AUTH_KEY"
echo "DeepL key loaded (${#DEEPL_AUTH_KEY} chars, not printed)"

# --- destination -----------------------------------------------------------
# Read from Zotero rather than hardcoding: this library has moved between a
# local folder and the Google Drive mount, and user.js re-pins it at startup.
if [[ -z "$DEST" ]]; then
  for prefs in "$ZOTERO_PROFILE/user.js" "$ZOTERO_PROFILE/prefs.js"; do
    [[ -f "$prefs" ]] || continue
    win_path="$(grep -ao 'user_pref("extensions\.zotero\.baseAttachmentPath", "[^"]*"' "$prefs" \
      | head -1 | sed 's/.*, "//; s/"$//' | sed 's/\\\\/\\/g')" || true
    if [[ -n "${win_path:-}" ]]; then
      DEST="$(wslpath -u "$win_path")"
      echo "destination from $(basename "$prefs"): $DEST"
      break
    fi
  done
fi
[[ -n "$DEST" ]] || { echo "could not determine the attachment base directory; pass --dest" >&2; exit 1; }
[[ -d "$DEST" ]] || { echo "destination does not exist: $DEST" >&2; exit 1; }

# --- fetch source ----------------------------------------------------------
STEM="paper-$RANDOM"
INPUT="$WORKDIR/$STEM.pdf"
if [[ -f "$SOURCE" ]]; then
  cp "$SOURCE" "$INPUT"
  echo "source: local file"
else
  if [[ "$SOURCE" =~ ^https?:// ]]; then URL="$SOURCE"; else URL="https://arxiv.org/pdf/$SOURCE"; fi
  echo "source: $URL"
  curl -sSL -o "$INPUT" "$URL"
fi
[[ "$(head -c 4 "$INPUT")" == "%PDF" ]] || { echo "not a PDF (no %PDF header): $INPUT" >&2; exit 1; }

# --- page range ------------------------------------------------------------
if [[ -z "$PAGES" ]]; then
  REF_PAGE="$("$PYTHON" "$PROBE" refpage "$INPUT")"
  if [[ "$REF_PAGE" -gt 1 ]]; then
    PAGES="1-$((REF_PAGE - 1))"
    echo "references start on page $REF_PAGE -> translating $PAGES"
  else
    PAGES="1-9999"
    echo "no reference heading found -> translating the whole document"
  fi
fi

# --- translate -------------------------------------------------------------
# --deepl is explicit: without it pdf2zh-next silently picks a free third-party
# engine. The glossary extractor would also send text to one, so it is off.
( cd "$WORKDIR" && "$PDF2ZH" "$STEM.pdf" --deepl --lang-in en --lang-out ko \
    --pages "$PAGES" --output . --no-auto-extract-glossary \
    --use-alternating-pages-dual --watermark-output-mode no_watermark )

MONO="$WORKDIR/$STEM.no_watermark.ko.mono.pdf"
DUAL="$WORKDIR/$STEM.no_watermark.ko.dual.pdf"
for produced in "$MONO" "$DUAL"; do
  [[ -f "$produced" ]] || { echo "pdf2zh did not produce $produced" >&2; exit 1; }
done

# --- verify ----------------------------------------------------------------
# DeepL's free tier rate-limits mid-run and leaves chunks untranslated without
# failing. Catch that here rather than filing a half-English PDF.
echo "--- Hangul coverage ---"
"$PYTHON" "$PROBE" hangul "$MONO" "$PAGES"
# Keep the library's one Korean font.
"$PYTHON" "$PROBE" font "$MONO"

# --- name and file ---------------------------------------------------------
BASE="$("$PYTHON" - "$AUTHOR" "$YEAR" "$TITLE" <<'PY'
import re, sys
author, year, title = sys.argv[1], sys.argv[2], sys.argv[3]
clean = re.sub(r'\s+', ' ', re.sub(r'[:\\/*?"<>|]', '', title)).strip()
print(f"{author} 등({year}), {clean}"[:92])
PY
)"

file_one() {
  local src="$1" name="$2" target="$DEST/$2"
  if [[ -e "$target" && $FORCE -eq 0 ]]; then
    echo "already exists (pass --force to replace): $name" >&2
    exit 1
  fi
  cp "$src" "$target"
  printf 'filed %6.2f MB  %s\n' "$(echo "scale=2; $(stat -c%s "$target")/1048576" | bc)" "$name"
}

file_one "$INPUT" "$BASE - Original PDF.pdf"
file_one "$MONO"  "$BASE - Korean Translation PDF (DeepL).pdf"
file_one "$DUAL"  "$BASE - Reading Dual PDF (EN-KO Alternating).pdf"

echo
echo "Done. Filed into: $DEST"
if [[ "$DEST" == "$(wslpath -u "$(grep -ao 'user_pref("extensions\.zotero\.baseAttachmentPath", "[^"]*"' "$ZOTERO_PROFILE/user.js" 2>/dev/null | head -1 | sed 's/.*, "//; s/"$//' | sed 's/\\\\/\\/g')" 2>/dev/null)" ]]; then
  echo "That is Zotero's linked-attachment base directory, so attach these as"
  echo "linked files (not stored copies) and Zotero will store relative paths."
fi
