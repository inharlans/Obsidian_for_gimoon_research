"""Read-only Zotero/Drive attachment check. Run with Windows Python on this host."""
import argparse
import configparser
import hashlib
import json
from pathlib import Path
import re
import urllib.request


def preferences(path):
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    result = {}
    for key, value in re.findall(r'^user_pref\("([^"]+)", (.+)\);\s*$', text, re.MULTILINE):
        try:
            result[key] = json.loads(value)
        except json.JSONDecodeError:
            continue
    return result


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def audit(profile, local, drive):
    prefs = preferences(profile / "prefs.js")
    overrides = preferences(profile / "user.js")
    base_key = "extensions.zotero.baseAttachmentPath"
    if not prefs.get(base_key):
        raise ValueError("Zotero linked attachment base is not configured")
    base = Path(prefs[base_key])
    items = []
    for start in range(0, 100000, 100):
        request = urllib.request.Request(
            f"http://127.0.0.1:23119/api/users/0/items?itemType=attachment&limit=100&start={start}",
            headers={"Zotero-API-Version": "3"},
        )
        with urllib.request.urlopen(request, timeout=15) as response:
            batch = json.load(response)
        items.extend(item["data"] for item in batch)
        if len(batch) < 100:
            break
    else:
        raise RuntimeError("Pagination limit reached; refusing an incomplete report")
    linked = [item for item in items if item.get("linkMode") == "linked_file"]
    missing = []
    for item in linked:
        raw = item.get("path", "")
        resolved = base / raw[len("attachments:"):] if raw.startswith("attachments:") else Path(raw)
        if not resolved.is_file():
            missing.append({"key": item["key"], "path": str(resolved)})
    local_files = {p.name: p for p in local.glob("*.pdf")}
    drive_files = {p.name: p for p in drive.glob("*.pdf")}
    mismatches = [name for name in sorted(local_files.keys() & drive_files.keys())
                  if digest(local_files[name]) != digest(drive_files[name])]
    return {
        "base_directory": str(base), "startup_override": overrides.get(base_key),
        "base_matches_startup_override": overrides.get(base_key, str(base)) == str(base),
        "linked_files": len(linked),
        "drive_url_attachments": sum(item.get("linkMode") == "linked_url" and
            item.get("url", "").startswith("https://drive.google.com/") for item in items),
        "missing_linked_files": missing,
        "local_root_available": local.is_dir(), "drive_root_available": drive.is_dir(),
        "local_pdfs": len(local_files), "drive_pdfs": len(drive_files),
        "hash_mismatches": mismatches,
        "drive_only": sorted(drive_files.keys() - local_files.keys()),
        "local_only": sorted(local_files.keys() - drive_files.keys()),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", type=Path)
    parser.add_argument("--local-root", type=Path, default=Path.home() / "Documents/PaperKG-Zotero-Attachments")
    parser.add_argument("--drive-root", type=Path, default=Path("G:/내 드라이브/PaperKG-Zotero-Attachments"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    profile = args.profile
    if profile is None:
        root = Path.home() / "AppData/Roaming/Zotero/Zotero"
        ini = configparser.ConfigParser()
        ini.read(root / "profiles.ini", encoding="utf-8")
        sections = [s for s in ini.sections() if s.startswith("Profile") and ini.has_option(s, "Path")]
        sections.sort(key=lambda s: ini.get(s, "Default", fallback="0") != "1")
        if not sections:
            parser.error("No Windows Zotero profile found; run Windows Python or pass --profile")
        section = sections[0]
        profile = Path(ini.get(section, "Path"))
        if ini.get(section, "IsRelative", fallback="1") == "1":
            profile = root / profile
    report = audit(profile, args.local_root, args.drive_root)
    text = json.dumps(report, ensure_ascii=True, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")
    return int(bool(report["missing_linked_files"] or report["hash_mismatches"] or
                    not report["drive_root_available"] or not report["base_matches_startup_override"]))


if __name__ == "__main__":
    raise SystemExit(main())
