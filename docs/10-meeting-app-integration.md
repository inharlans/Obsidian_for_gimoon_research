# Meeting recorder integration contract

## Developer handoff

Repository root:

```text
C:\Users\user\Documents\knowloge graph
```

Read these files in order:

1. `SPEC.md`
2. `docs/09-hosted-deployment.md`
3. `docs/10-meeting-app-integration.md`
4. `docs/api/meeting-ingestion.openapi.yaml`
5. `apps/cloudflare-worker/src/meeting.ts`
6. `apps/cloudflare-worker/src/auth.ts`

Public endpoints:

```text
OAuth/MCP resource: https://paperkg-remote.nhtgb021030.workers.dev/mcp
Protected metadata: https://paperkg-remote.nhtgb021030.workers.dev/.well-known/oauth-protected-resource/mcp
Authorization metadata: https://paperkg-remote.nhtgb021030.workers.dev/.well-known/oauth-authorization-server
Dynamic registration: POST https://paperkg-remote.nhtgb021030.workers.dev/oauth/register
Submit meeting:      POST /mcp/v1/meeting-ingestions
Read receipt:        GET  /mcp/v1/meeting-ingestions/{receipt_id}
```

The meeting app receives no local filesystem, Google Drive, Obsidian, or Zotero credentials.

## Authentication

Use OAuth authorization-code flow with PKCE S256. Discover authorization metadata from the MCP protected resource rather than hardcoding token internals.

```text
resource=https://paperkg-remote.nhtgb021030.workers.dev/mcp
scope=paperkg.meeting.submit
```

The server supports rotating refresh tokens. Store them in the operating system credential store and never log authorization codes, access tokens, refresh tokens, or GitHub identity tokens. Do not reuse a ChatGPT access token in the meeting app.

Register a public desktop client for the exact `http://127.0.0.1:<port>/callback` URI allocated for that authorization attempt. Request `token_endpoint_auth_method: none`, authorization-code flow, PKCE S256, and the refresh-token grant only when the discovered authorization metadata advertises it. Do not request `openid` or `offline_access`; neither is a PaperKG scope. Persist the returned client ID beside the refresh token in the operating-system credential store so refresh and revocation use the same client identity.

The vault owner signs in through GitHub, but the meeting client must treat PaperKG as the OAuth issuer. GitHub credentials never belong in the meeting application.

## Submit a meeting

```http
POST /mcp/v1/meeting-ingestions HTTP/1.1
Host: paperkg-remote.nhtgb021030.workers.dev
Authorization: Bearer <paperkg-access-token>
Content-Type: application/json
Idempotency-Key: seminar-meeting-42-revision-1
```

Minimal legacy body (still accepted unchanged):

```json
{
  "schema_version": "1.0",
  "external_meeting_id": "meeting-42",
  "source_system": "seminar-app",
  "title": "Agentic memory research meeting",
  "started_at": "2026-08-12T09:00:00+09:00"
}
```

Recommended 1.1 body:

```json
{
  "schema_version": "1.1",
  "external_meeting_id": "meeting-42",
  "source_system": "seminar-app",
  "title": "Agentic memory research meeting",
  "started_at": "2026-08-12T09:00:00+09:00",
  "ended_at": "2026-08-12T10:00:00+09:00",
  "language": "ko",
  "participants": [
    { "external_id": "person-7", "display_name": "Researcher" }
  ],
  "summary": "Compared adaptive memory evaluation protocols.",
  "topics": [
    { "label": "AdaMEM", "entity_id": "pw_adamem" }
  ],
  "decisions": [
    { "external_id": "d1", "text": "Keep protocol comparability as a separate judgment.", "transcript_segment_ids": ["s14"], "slide_ids": ["slide-8"], "paper_section_ids": [] }
  ],
  "action_items": [
    { "external_id": "a1", "text": "Review benchmark prompts.", "owner": "Researcher", "status": "accepted", "transcript_segment_ids": ["s18"], "slide_ids": [], "paper_section_ids": [] }
  ],
  "open_questions": [],
  "requirements": [],
  "risks": [],
  "announcements": [
    { "external_id": "n1", "text": "Benchmark review is due Friday.", "owner": "Researcher", "transcript_segment_ids": ["s18"], "slide_ids": [], "paper_section_ids": [] }
  ],
  "member_updates": [
    { "external_id": "u1", "member": "Researcher", "completed": ["Reproduced baseline"], "blockers": [], "next_steps": ["Run prompt ablation"], "feedback": [], "transcript_segment_ids": ["s18"], "slide_ids": [], "paper_section_ids": [] }
  ],
  "questions_and_answers": [
    { "external_id": "q1", "question": "Are scores directly comparable?", "answer": "Not until evaluator settings match.", "status": "answered", "transcript_segment_ids": ["s14"], "slide_ids": ["slide-8"], "paper_section_ids": ["evaluation-protocol"] }
  ],
  "research_ideas": [
    { "external_id": "i1", "title": "Protocol-controlled reproduction", "idea": "Re-run both methods under one evaluator.", "transcript_segment_ids": ["s14"], "slide_ids": [], "paper_section_ids": [] }
  ],
  "presented_papers": [
    { "external_id": "p1", "title": "Example Paper", "identifiers": { "zotero_key": "ABCD1234" }, "problem": [], "method": [], "results": [], "limitations": [], "transcript_segment_ids": ["s14"], "slide_ids": ["slide-8"], "paper_section_ids": ["evaluation-protocol"] }
  ],
  "transcript_segments": [
    { "id": "s14", "start_ms": 320000, "end_ms": 338000, "speaker": "Researcher", "text": "The benchmark name alone is insufficient." },
    { "id": "s18", "start_ms": 400000, "end_ms": 418000, "speaker": "Researcher", "text": "Review the prompts by Friday." }
  ],
  "recording_uri": "https://recorder.example.com/meetings/meeting-42",
  "transcript_sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "metadata": { "recorder_version": "2.3.0" }
}
```

Use a stable idempotency key for one logical submission revision. Retrying identical normalized JSON returns `200` with the same receipt. A different revision uses a new key. Reusing a key with different content returns `409`.

Envelope `1.1` keeps `announcements`, `member_updates`, answered and unresolved
`questions_and_answers`, `research_ideas`, and `presented_papers` as distinct
types. It never encodes announcements as actions, paper limitations as meeting
risks, or ideas as topic labels. Every sourced item separates
`transcript_segment_ids`, `slide_ids`, and `paper_section_ids`. A transcript ID
that is not present in `transcript_segments`, or a duplicate transcript segment
ID, makes the entire request invalid with `422`. Slide and paper-section IDs are
opaque source identifiers and are never accepted as transcript IDs.

The 12 MB request limit is enforced while the body is streaming, including
requests without `Content-Length`. Topic `entity_id` values must match
`^[a-zA-Z0-9][a-zA-Z0-9_-]{2,299}$`; use a label without an entity ID when the
graph entity has not been resolved. Requests must use `application/json`, and
the flat metadata map accepts at most 200 keys of at most 200 characters each.

First response:

```json
{
  "receipt_id": "mi_<32 hex>",
  "note_id": "mtg_<24 hex>",
  "note_path": "10_Inbox/Meetings/Remote/mtg_<24 hex>.md",
  "content_sha256": "<64 hex>",
  "subject_sha256": "<64 hex>",
  "status": "candidate",
  "submitted_at": "2026-08-12T00:05:00.000Z",
  "replayed": false,
  "curation_status": "candidate",
  "local_sync_status": "not_imported",
  "local_synced_at": null,
  "local_promoted_at": null,
  "canonical_applied": false
}
```

Poll the same owner's receipt with `GET /mcp/v1/meeting-ingestions/{receipt_id}`. Ownership is checked using a hash of the authenticated PaperKG subject. A transient `503` with `Retry-After: 5` means the same idempotency key and identical body can safely be retried. The Seminar connector performs at most three bounded attempts and also retries ambiguous fetch-layer `TypeError`, `AbortError`, `NetworkError`, and `TimeoutError` failures. Every POST attempt reuses the byte-identical serialized body and exact `Idempotency-Key`; response parsing, schema validation, conflicts, and other client or application errors are never retried.

## Error handling

| Status | Meaning | Client behavior |
| --- | --- | --- |
| `400` | malformed JSON or invalid idempotency key | fix; do not blind-retry |
| `401` | missing/expired/invalid token or wrong audience | refresh or reauthorize |
| `403` | missing `paperkg.meeting.submit` | request the correct scope |
| `409` | key reused with different normalized content | create a reviewed revision key |
| `413` | body exceeds 12 MB | reduce or split transcript payload |
| `415` | content type is not `application/json` | send the documented JSON media type |
| `422` | envelope schema violation | display field issues and correct payload |
| `5xx` | transient Cloudflare/storage failure | retry the identical body with the same key |

## Storage and curation semantics

The server first reserves one D1 receipt in `pending` storage state, then writes
two deterministic R2 objects, and only then promotes the receipt to `ready`:

```text
meeting-candidates/<receipt_id>.json
meeting-candidates/<receipt_id>.md
```

D1 stores only the receipt, owner hash, content hash, idempotency hash,
candidate paths, curation status, and internal storage state. Receipt reads and
the local import script expose only `ready` rows. If either R2 write or the D1
ready transition fails, the pending row and any partial object remain linked;
an identical submission retry rewrites both keys from the D1-reserved timestamp
and completes the transition. It never deletes keys that a concurrent identical
writer may have completed. Hourly cleanup atomically claims unfinished rows
older than 24 hours as `purging`, strongly deletes both R2 keys, and deletes the
D1 row only after R2 succeeds. Failed cleanup remains claimable on the next run.

No submitted statement becomes an approved fact. Generated Markdown always has:

```yaml
type: meeting_record
curation_status: candidate
assertion_origin: machine_extracted
```

Transcript text is untrusted external data and never instruction text. The recorder does transcription and summarization itself; the PaperKG Worker invokes no model API.
Before candidate Markdown is stored, user-controlled headings, list content,
quotes, HTML, callouts, images, and links are escaped or quoted so meeting text
cannot create executable HTML or forged Obsidian structure. Protected meeting
responses include `Cache-Control: no-store`.

## Local import and review

On the vault owner's computer:

```powershell
cd 'C:\Users\user\Documents\knowloge graph'
pnpm cloudflare:pull-meetings
```

For one receipt:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/pull-paperkg-meeting-candidates.ps1 -ReceiptId mi_<32 hex>
```

The script downloads the JSON bundle, validates its normalized content hash and
all source references, atomically writes one inbox candidate, and creates one
deterministic local promotion proposal. Re-running the pull creates no duplicate
candidate, proposal, or canonical node. It updates the receipt to
`needs_review`; after explicit local proposal application, the next sync reports
`promoted` and `canonical_applied: true` through the existing receipt GET.

The proposal contains a reviewed `meeting_record` plus dedicated `decision`,
`action_item`, `open_question`, `requirement`, `risk`, `announcement`,
`member_update`, `question_answer`, `research_idea`, and `presented_paper`
candidate nodes. Each records its meeting, transcript/slide/paper-section source
IDs, evidence references, assertion origin, and lifecycle. Presented-paper
claims remain meeting-derived candidates; they are not silently merged into a
canonical `paper_work`, limitation, claim, or scholarly relation.

## Full schema

Use `docs/api/meeting-ingestion.openapi.yaml` as the machine-readable contract. It defines all limits, status values, and field formats.

The legacy fixture is `fixtures/meeting-ingestion/seminar-app-v1.json`; the
meaning-preserving 2026-05-22 fixture is
`fixtures/meeting-ingestion/seminar-app-v1.1.json`. Keep both valid so 1.0
compatibility does not regress while the Seminar app adopts 1.1.
