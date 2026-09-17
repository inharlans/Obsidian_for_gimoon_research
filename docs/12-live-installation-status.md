# Live installation and operator status

Updated: 2026-09-03

## Completed

| Component | State |
| --- | --- |
| Zotero | 9.0.6; local database preserved at `C:\Users\user\Zotero` |
| Obsidian | 1.13.6; canonical vault at `C:\Users\user\Documents\knowloge graph\vault\PaperKG` |
| Google Drive Desktop | 130.0.2.0; mounted as `G:\내 드라이브` when signed in; PaperKG backup skips quietly while unavailable |
| Attanger | 1.4.9 enabled and configured |
| Zotero linked PDFs | 40/40 relative links resolve from stable local root `C:\Users\user\Documents\PaperKG-Zotero-Attachments`; no stored attachments |
| Zotero Drive replica | existing private Drive folder preserved; local/Drive 40/40, SHA-256 mismatch 0, conflict 0; missing-only two-way guard runs hidden every 2 minutes |
| Zotero mobile fallback | 40/40 parents have metadata-only `Google Drive에서 PDF 열기` linked URL; no public-sharing change |
| Zotero safety backup | current `C:\Users\user\Documents\Zotero-Backups\20260903-before-drive-url-links`; earlier pre-migration backup retained |
| PaperKG Drive copy | hidden additive allowlist copy scheduled hourly; unavailable Drive and unchanged source are quiet successful skips |
| Cloudflare login | Wrangler OAuth authenticated as `nhtgb021030@gmail.com` |
| Cloudflare KV | `OAUTH_KV` created and bound |
| Cloudflare R2 | `paperkg-storage` created and bound |
| Cloudflare D1 | `paperkg-remote` created; meeting storage/curation state, atomic OAuth state, encrypted redirect recovery, and one-time reissue migrations applied through `0007` |
| OAuth expiry cleanup | hourly Worker Cron Trigger active (`0 * * * *`) |
| Approved snapshot | 445 notes and 110 explicit relations uploaded to R2 |
| Remote Worker | `meeting-graph-quality-v18` (version `e3142454-88c1-4acb-bb3a-36bfdc1b0200`) deployed at `https://paperkg-remote.nhtgb021030.workers.dev` |
| MCP protection | unauthenticated `/mcp` returns OAuth `401` challenge |
| Health endpoint | `/health` returns `200`; encrypted OAuth recovery, GitHub OAuth configuration, and stale meeting-storage detection are all `ready` |
| GitHub OAuth App | registered with production homepage/callback |
| GitHub OAuth secrets | encrypted Worker secrets registered; values never written to the repository |
| OAuth browser flow | exact-loopback DCR + PKCE S256 + token exchange verified live |
| Account portability | OpenAI-account-independent DCR/CIMD, refresh-token, PKCE, resource, and 401 challenge contract verified; PaperKG owner remains the allowlisted GitHub identity |
| MCP smoke test | protocol `2025-11-25`; 12 tools listed; live `A-MEM` search passed |
| Meeting ingestion E2E | live POST + receipt GET verified; candidate only, canonical vault untouched |
| Meeting storage recovery | D1 `pending → ready → purging` protocol deployed; existing receipt preserved as `ready`; stale unfinished storage is reclaimed hourly |
| Seminar retry contract | transient `503` and ambiguous fetch transport failures use bounded retries; POST retries preserve byte-identical body and `Idempotency-Key`; core tests 27/27 |
| Public OAuth exhaustion guard | OAuth bodies capped at 64 KiB before parsing; exact MCP capped at 1 MiB; DCR and OAuth mutation rate-limit bindings enabled with fail-closed non-secret errors |
| Drive task hardening | hidden `wscript.exe` launcher, hidden task setting, non-interactive PowerShell, 5-minute execution limit, one-hour trigger, source fingerprint debounce, and bounded 100-entry non-secret result history verified; scheduled run returned `0x00000000` with no visible console window |

## Live meeting-app verification

The 2026-08-12 production run completed through the desktop loopback callback, token exchange, candidate submission, and receipt read-back. The app received only `paperkg.meeting.submit`; token material remained in Windows safeStorage while SQLite retained opaque references. Receipt `mi_04a25fab35669c7a700725197ff419a6` was returned with `status: candidate`, `replayed: false`, and content hash `2fdc526c51d840e46ece8651d9cf807951a1cf4c9a24e54cff103f1f4bab4b71`. `canonicalApplied` remained false.

On 2026-08-13, the same live receipt was pulled through the JSON-bundle
importer. It produced exactly one inbox candidate and one deterministic
promotion proposal. An identical second pull left both counts at one and the
canonical meeting count at zero. D1 now reports
`local_sync_status=needs_review`, while the original candidate/storage state
and OAuth account remain intact. The installed Obsidian view displays
`검토 필요 1건`, `정본 반영 완료 0건` and runs the same pull at startup and
every 15 minutes.

## OAuth verification command

The encrypted GitHub secrets are already configured. To repeat the end-to-end browser test without printing a token:

```powershell
cd 'C:\Users\user\Documents\knowloge graph'
pnpm cloudflare:smoke-oauth
```

The test dynamically allocates a localhost callback port, opens a ten-minute consent window, searches for `A-MEM`, revokes the temporary access token, and removes its temporary URL file.

For an account switch, first run the non-interactive, read-only contract check:

```powershell
pnpm cloudflare:check-account-switch
```

It verifies that the deployed server advertises the OAuth contract a different
ChatGPT/Codex account needs to create its own client and maintain connectivity
through refresh tokens. It does not register a client or issue a token. The
final authorization still requires one owner consent using GitHub login
`inharlans` in the new account's app connection.

## Operator commands

```powershell
# Full local verification
pnpm check

# Publish newly reviewed knowledge
pnpm cloudflare:publish

# Deploy Worker code/config changes
pnpm cloudflare:deploy

# Pull untrusted meeting candidates into the local review inbox
pnpm cloudflare:pull-meetings
```

## New ChatGPT account connection

Create a custom app with:

```text
https://paperkg-remote.nhtgb021030.workers.dev/mcp
```

Select OAuth, scan tools, authorize with GitHub login `inharlans`, then test `search`, `fetch`, `get_paper`, and `compare_papers`. The Worker is intentionally read-only even if ChatGPT supports write actions.

Changing the ChatGPT/Codex account does not require a Worker deployment, a new
GitHub OAuth App, a snapshot upload, or changes to Obsidian and Zotero. The new
OpenAI account receives a separate connector client and tokens while the GitHub
owner ID keeps PaperKG data ownership stable.

## Safety facts

- Cloudflare has no access to `C:\Users\user\Zotero` or Google Drive credentials.
- R2 contains a derived approved snapshot plus untrusted candidate submissions, not the canonical vault.
- D1 and KV are operational state and never knowledge sources of truth.
- Remote meeting records stay `candidate` until pulled and human-reviewed locally.
- No model API is used by the Worker or the meeting ingestion endpoint.
