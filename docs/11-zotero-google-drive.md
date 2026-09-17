# Zotero linked PDFs with a stable local root and Google Drive replica

## Final configuration on this computer

The setup follows the user's newer [Zotero 7 + Google Drive + Notion guide](https://velog.io/@go00od/zotero-%EC%A1%B0%ED%85%8C%EB%A1%9C-7-%EC%82%AC%EC%9A%A9%EB%B2%95zoteroGoogle-DriveNotion-%EC%97%B0%EB%8F%99), using Attanger as the ZotFile replacement. The older [Tistory guide](https://architecturalgarden.tistory.com/14) is a secondary operational reference.

```text
Zotero database:     C:\Users\user\Zotero
Zotero profile:      C:\Users\user\AppData\Roaming\Zotero\Zotero\Profiles\zno9k7cs.default
Stable linked PDFs:  C:\Users\user\Documents\PaperKG-Zotero-Attachments
Drive PDF replica:   G:\내 드라이브\PaperKG-Zotero-Attachments
Drive vault copy:   G:\내 드라이브\PaperKG-Vault-Sync\PaperKG
Current backup:     C:\Users\user\Documents\Zotero-Backups\20260903-before-drive-url-links
```

The Zotero database and its linked-PDF root remain on stable local filesystem
paths. Google Drive is an additional private replica, not the path Zotero needs
to open a PDF. Putting `zotero.sqlite` in Drive/Dropbox/OneDrive can corrupt it
and is not part of this setup. This design intentionally preserves Zotero
`linked_file` attachments and does not convert them to `stored_file`.

## Verified recovery result — 2026-09-03

- Zotero 9.0.6
- Attanger 1.4.9 enabled
- Better BibTeX, Better Notes, Oing, and Translate restored and enabled
- 40 linked-file attachments
- 40 linked-URL child attachments
- 80 attachment records total
- 0 stored/imported attachments
- 40/40 Zotero file paths stored relative to the linked attachment base
- 40 local PDFs and 40 Drive PDFs
- 0 missing files and 0 SHA-256 mismatches
- 0 synchronization conflicts
- 40 metadata-only private Drive URL attachments for mobile access
- 245,357,724 bytes total

Role distribution:

- 13 Original PDF
- 13 Korean Translation PDF (DeepL)
- 13 Reading Dual PDF (EN–KO alternating)
- 1 G-Memory study-notes attachment

Every Drive PDF hash matches the stable local copy. During a failure-injection
test, Google Drive was stopped and `G:` disappeared; Zotero still resolved and
found all 40 PDFs from the stable local root. The post-migration Zotero SQLite
`quick_check` returned `ok`. The current safety backup is
`C:\Users\user\Documents\Zotero-Backups\20260903-before-drive-url-links`.

## Collision-safe filename template

```text
{{ firstCreator suffix="(" }}{{ year suffix="), " }}{{ title truncate="80" }} - {{ attachmentTitle truncate="40" replaceFrom="\.pdf$" replaceTo="" regexOpts="i" }}
```

The attachment title is intentionally included because each paper may have Original, Korean, and alternating dual PDFs. The simpler blog template can collide when several PDFs share one parent item.

Attanger destination, Zotero Linked Attachment Base Directory, and Better
BibTeX attachment base all point to:

```text
C:\Users\user\Documents\PaperKG-Zotero-Attachments
```

Preferences are reproducibly recorded in `config/zotero/user.paperkg.js` and the active profile's `user.js`.

- linking enabled
- relative linked paths enabled
- automatic move/rename enabled
- `moveWithoutDeleting=false` so Attanger moves into the stable local root
  without retaining a second unmanaged source
- collection subfolders disabled because the current library has no collection-based layout requirement
- shortcut enabled: `Ctrl+Shift+R`

## Missing-only Drive guard

`C:\Users\user\Documents\Zotero-Drive-Guard` contains the installed hidden
user-session guard. It checks the `G:` mount every 30 seconds and, while Drive
is healthy, synchronizes every 2 minutes.

The detailed recovery evidence is retained in that directory as
`RECOVERY_REPORT.md`; `README.md` is the operator guide and
`verify-zotero-linked-pdfs.ps1` is the supported health check.

- Startup registration:
  `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\ZoteroDriveGuard`
- Local root: `C:\Users\user\Documents\PaperKG-Zotero-Attachments`
- Drive root: `G:\내 드라이브\PaperKG-Zotero-Attachments`
- Copy rule: copy only a missing PDF in either direction
- Conflict rule: same name with different content stops as a conflict; neither
  file is overwritten
- Deletion rule: files are never deleted or mirrored away
- Recovery: when Drive is not running, discover and start the newest installed
  `GoogleDriveFS.exe`, then wait for the mount
- Runtime: hidden `wscript.exe //B` and hidden PowerShell; no terminal window

The guard runs in the interactive user session because a Task Scheduler token
cannot reliably see Drive's virtual mount. It does not edit Zotero metadata.
Its bounded, non-secret state contains counts and health only:

```text
%LOCALAPPDATA%\ZoteroDriveGuard\status.json
%LOCALAPPDATA%\ZoteroDriveGuard\sync-status.json
%LOCALAPPDATA%\ZoteroDriveGuard\history.jsonl
```

Run its verification commands from the guard directory:

```powershell
# Fast path and Zotero link check
powershell -NoProfile -ExecutionPolicy Bypass -File .\verify-zotero-linked-pdfs.ps1

# Full local/Drive SHA-256 comparison
powershell -NoProfile -ExecutionPolicy Bypass -File .\verify-zotero-linked-pdfs.ps1 -Deep
```

## Mobile access

Zotero's official mobile clients do not open `linked_file` attachments. Each
paper therefore has a metadata-only child attachment named
`Google Drive에서 PDF 열기`. It opens the corresponding Drive URL through the
user's existing Google account. No public-sharing permission was added, and
the URL is not a second PDF or a Zotero Storage upload.

The desktop file attachment remains the authoritative attachment record. The
URL child is only a mobile access affordance.

## Other computers

1. Install Zotero, Google Drive Desktop, and Attanger.
2. Sign in to Zotero Data Sync for items, notes, tags, relative linked-file
   metadata, and the metadata-only Drive URL children.
3. Sign in to the same Google Drive account.
4. Create a stable local attachment root on that computer and copy missing PDFs
   from the existing Drive folder into it without overwriting conflicts.
5. Set Zotero Linked Attachment Base Directory, Attanger destination, and
   Better BibTeX attachment base to that stable local root—not the Drive mount.
6. Confirm Zotero resolves relative paths while Drive is stopped, then install
   an equivalent missing-only guard for that computer.
7. Test several Original/Korean/Dual PDFs and the private mobile URL child.

Drive letters and stable local paths may differ by computer. Never copy
`C:\Users\user\Zotero` through Drive. Do not point a second computer at this
machine's absolute path, and do not convert this library to stored attachments
as part of setup. See Zotero's [Adding Files](https://www.zotero.org/support/attaching_files),
[Advanced preferences](https://www.zotero.org/support/preferences/advanced),
and [Syncing](https://www.zotero.org/support/sync) documentation.

## PaperKG vault copy boundary

The scheduled task `PaperKG Google Drive Safe Sync` runs once per hour through
`scripts/run-paperkg-google-drive-sync-hidden.vbs`. The launcher starts
`scripts/sync-paperkg-to-google-drive.ps1` without a visible console window.
The task itself is also marked hidden.

Before traversing the vault, the script checks that Google Drive and the
dedicated `PaperKG-Vault-Sync` folder are available. An unavailable Drive is a
quiet, successful `skipped` run rather than an error. When the eligible source
files have not changed since the last successful copy, it skips `robocopy`.
Otherwise, it performs an additive copy of only `.md`, `.yaml`, `.yml`, and
`.json`.

It excludes:

- `.paperkg` and SQLite/WAL files
- `.obsidian` workspace state
- `Attachments` and PDFs
- `node_modules` and build output

It never mirrors deletions. The local vault remains canonical; the Drive copy is a recoverable/synchronization copy, not the live database behind the public MCP.

The latest result and at most 100 history entries are written locally to:

```text
.paperkg/operations/google-drive-sync-status.json
.paperkg/operations/google-drive-sync-history.jsonl
```

These records contain only status codes, timestamps, counts, byte totals,
duration, one-way source/destination fingerprints, and the `robocopy` exit
code. They deliberately omit account data, file names, content, and filesystem paths. Ordinary skip
reasons are `google_drive_unavailable`, `dedicated_folder_unavailable`, and
`source_unchanged`.

To recreate the task after moving the repository, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install-paperkg-google-drive-sync-task.ps1
```

## Public-access boundary

The Cloudflare Worker receives a filtered `reviewed/verified` JSON snapshot. It gets no Zotero API, local database, Drive OAuth token, full private PDF, or direct filesystem access. Paper extraction and normalization are local Codex curation operations for user-selected papers only.
