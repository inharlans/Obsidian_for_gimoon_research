import { z } from "zod";
import { loadSnapshot, noteByIdOrAlias, publicNote } from "./snapshot.js";
import type { AuthProps, Env } from "./types.js";

const itemId = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(50_000);
const sourceRefsV11 = {
  transcript_segment_ids: z.array(itemId).max(100).default([]),
  slide_ids: z.array(itemId).max(100).default([]),
  paper_section_ids: z.array(itemId).max(100).default([]),
};
const legacyStatement = z.object({
  external_id: itemId.optional(),
  text: longText,
  made_by: z.string().max(500).optional(),
  segment_ids: z.array(itemId).max(100).default([]),
}).strict();
const sourcedStatement = z.object({
  external_id: itemId.optional(),
  text: longText,
  made_by: z.string().max(500).optional(),
  ...sourceRefsV11,
}).strict();
const participant = z.object({
  external_id: itemId.optional(),
  display_name: z.string().trim().min(1).max(500),
  email: z.string().trim().pipe(z.email().max(500)).optional(),
}).strict();
const topic = z.object({
  label: z.string().trim().min(1).max(500),
  entity_id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,299}$/).optional(),
}).strict();
const transcriptSegment = z.object({
  id: itemId,
  start_ms: z.number().int().min(0).optional(),
  end_ms: z.number().int().min(0).optional(),
  speaker: z.string().trim().min(1).max(500).optional(),
  text: z.string().min(1).max(20_000),
}).strict().refine((value) => value.start_ms === undefined || value.end_ms === undefined || value.end_ms >= value.start_ms, {
  message: "end_ms must be greater than or equal to start_ms",
});
const metadata = z.record(z.string().max(200), z.union([z.string().max(5_000), z.number(), z.boolean(), z.null()]))
  .refine((value) => Object.keys(value).length <= 200, { message: "metadata must contain at most 200 entries" })
  .default({});
const commonFields = {
  external_meeting_id: z.string().trim().min(1).max(500),
  source_system: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(1_000),
  started_at: z.iso.datetime({ offset: true }),
  ended_at: z.iso.datetime({ offset: true }).optional(),
  language: z.string().trim().min(2).max(35).default("ko"),
  participants: z.array(participant).max(200).default([]),
  summary: z.string().trim().max(50_000).optional(),
  topics: z.array(topic).max(500).default([]),
  transcript_segments: z.array(transcriptSegment).max(5_000).default([]),
  recording_uri: z.url().max(4_000).optional(),
  transcript_sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  metadata,
};
const v10Envelope = z.object({
  schema_version: z.literal("1.0"),
  ...commonFields,
  decisions: z.array(legacyStatement).max(500).default([]),
  action_items: z.array(legacyStatement.extend({
    owner: z.string().max(500).optional(),
    due_at: z.iso.datetime({ offset: true }).optional(),
    status: z.enum(["proposed", "accepted", "done", "cancelled", "unknown"]).default("unknown"),
  }).strict()).max(1_000).default([]),
  open_questions: z.array(legacyStatement).max(1_000).default([]),
  requirements: z.array(legacyStatement).max(1_000).default([]),
  risks: z.array(legacyStatement.extend({
    severity: z.enum(["low", "medium", "high", "unknown"]).default("unknown"),
    mitigation: z.string().max(20_000).optional(),
  }).strict()).max(1_000).default([]),
}).strict();
const paperIdentifiers = z.object({
  doi: z.string().max(300).optional(),
  arxiv_id: z.string().max(300).optional(),
  openreview_id: z.string().max(300).optional(),
  zotero_key: z.string().max(300).optional(),
  paperkg_entity_id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,299}$/).optional(),
}).strict().default({});
const v11Envelope = z.object({
  schema_version: z.literal("1.1"),
  ...commonFields,
  decisions: z.array(sourcedStatement).max(500).default([]),
  action_items: z.array(sourcedStatement.extend({
    owner: z.string().max(500).optional(),
    due_at: z.iso.datetime({ offset: true }).optional(),
    status: z.enum(["proposed", "accepted", "done", "cancelled", "unknown"]).default("unknown"),
  }).strict()).max(1_000).default([]),
  open_questions: z.array(sourcedStatement).max(1_000).default([]),
  requirements: z.array(sourcedStatement).max(1_000).default([]),
  risks: z.array(sourcedStatement.extend({
    severity: z.enum(["low", "medium", "high", "unknown"]).default("unknown"),
    mitigation: z.string().max(20_000).optional(),
  }).strict()).max(1_000).default([]),
  announcements: z.array(z.object({
    external_id: itemId.optional(),
    text: longText,
    owner: z.string().max(500).optional(),
    due_at: z.iso.datetime({ offset: true }).optional(),
    made_by: z.string().max(500).optional(),
    ...sourceRefsV11,
  }).strict()).max(500).default([]),
  member_updates: z.array(z.object({
    external_id: itemId.optional(),
    member: z.string().min(1).max(500),
    completed: z.array(z.string().min(1).max(2_000)).max(100).default([]),
    blockers: z.array(z.string().min(1).max(2_000)).max(100).default([]),
    next_steps: z.array(z.string().min(1).max(2_000)).max(100).default([]),
    feedback: z.array(z.string().min(1).max(2_000)).max(100).default([]),
    ...sourceRefsV11,
  }).strict()).max(500).default([]),
  questions_and_answers: z.array(z.object({
    external_id: itemId.optional(),
    question: z.string().min(1).max(50_000),
    answer: z.string().min(1).max(50_000).optional(),
    questioner: z.string().max(500).optional(),
    answerer: z.string().max(500).optional(),
    status: z.enum(["answered", "partial", "unresolved"]),
    ...sourceRefsV11,
  }).strict()).max(1_000).default([]),
  research_ideas: z.array(z.object({
    external_id: itemId.optional(),
    title: z.string().min(1).max(1_000).optional(),
    idea: longText,
    proposer: z.string().max(500).optional(),
    research_question: z.string().max(50_000).optional(),
    feasibility: z.string().max(50_000).optional(),
    ...sourceRefsV11,
  }).strict()).max(500).default([]),
  presented_papers: z.array(z.object({
    external_id: itemId.optional(),
    title: z.string().min(1).max(1_000),
    identifiers: paperIdentifiers,
    summary: z.string().max(50_000).optional(),
    problem: z.array(z.string().max(5_000)).max(100).default([]),
    method: z.array(z.string().max(5_000)).max(100).default([]),
    results: z.array(z.string().max(5_000)).max(100).default([]),
    limitations: z.array(z.string().max(5_000)).max(100).default([]),
    ...sourceRefsV11,
  }).strict()).max(200).default([]),
}).strict();

export const meetingEnvelopeSchema = z.discriminatedUnion("schema_version", [v10Envelope, v11Envelope]).superRefine((value, context) => {
  if (value.ended_at !== undefined && Date.parse(value.ended_at) < Date.parse(value.started_at)) {
    context.addIssue({ code: "custom", path: ["ended_at"], message: "ended_at must be greater than or equal to started_at", input: value.ended_at });
  }
  const known = new Set<string>();
  for (const [index, segment] of value.transcript_segments.entries()) {
    if (known.has(segment.id)) context.addIssue({ code: "custom", path: ["transcript_segments", index, "id"], message: `duplicate transcript segment id: ${segment.id}`, input: segment.id });
    known.add(segment.id);
  }
  const collections: Array<[string, Array<Record<string, unknown>>]> = [
    ["decisions", value.decisions], ["action_items", value.action_items], ["open_questions", value.open_questions],
    ["requirements", value.requirements], ["risks", value.risks],
  ];
  if (value.schema_version === "1.1") collections.push(
    ["announcements", value.announcements], ["member_updates", value.member_updates],
    ["questions_and_answers", value.questions_and_answers], ["research_ideas", value.research_ideas],
    ["presented_papers", value.presented_papers],
  );
  for (const [collection, items] of collections) items.forEach((item, itemIndex) => {
    const refs = value.schema_version === "1.0" ? item.segment_ids : item.transcript_segment_ids;
    for (const [refIndex, ref] of ((refs as string[] | undefined) ?? []).entries()) {
      if (!known.has(ref)) context.addIssue({
        code: "custom", path: [collection, itemIndex, value.schema_version === "1.0" ? "segment_ids" : "transcript_segment_ids", refIndex],
        message: `unknown transcript segment id: ${ref}`, input: ref,
      });
    }
  });
});

type MeetingEnvelope = z.infer<typeof meetingEnvelopeSchema>;
const MAX_REQUEST_BYTES = 12_000_000;

export class RequestBodyTooLargeError extends Error {}

export async function readBoundedRequestText(request: Request, maxBytes: number): Promise<string> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) throw new RequestBodyTooLargeError();
  }
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const chunks: string[] = [];
  let receivedBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel("request body limit exceeded");
      throw new RequestBodyTooLargeError();
    }
    chunks.push(decoder.decode(value, { stream: true }));
  }
  chunks.push(decoder.decode());
  return chunks.join("");
}

interface ReceiptRow {
  receipt_id: string;
  content_sha256: string;
  note_id: string;
  note_path: string;
  submitted_at: string;
  status: "candidate";
  r2_json_key: string;
  r2_markdown_key: string;
  storage_state: "pending" | "ready" | "purging";
  local_sync_status: "not_imported" | "needs_review" | "promoted" | "rejected";
  local_synced_at: string | null;
  local_promoted_at: string | null;
}

interface CleanupReceiptRow {
  receipt_id: string;
  r2_json_key: string;
  r2_markdown_key: string;
}

interface D1QuerySource {
  prepare(query: string): D1PreparedStatement;
}

function requireScope(props: AuthProps, scope: string): Response | undefined {
  if (props.scopes.includes(scope)) return undefined;
  return privateJson({ error: "insufficient_scope", required_scope: scope }, { status: 403 });
}

function privateJson(value: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("cache-control", "no-store");
  return Response.json(value, { ...init, headers });
}

async function sha256(value: string): Promise<string> {
  const result = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function markdownInline(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/([\\`*_\[\]!])/g, "\\$1");
}

function markdownQuote(value: string): string {
  return value.split(/\r?\n/).map((line) => `> ${markdownInline(line)}`).join("\n");
}

function markdownList(items: Array<{ text: string }>): string {
  return items.length ? items.map((item) => `- ${markdownInline(item.text)}`).join("\n") : "- 없음";
}

function jsonBlock(kind: string, value: unknown): string {
  return `\`\`\`paperkg-${kind}\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function candidateMarkdown(envelope: MeetingEnvelope, receipt: ReceiptRow): string {
  const participants = envelope.participants.map((item) => markdownInline(item.display_name)).join(", ");
  const transcript = envelope.transcript_segments.length
    ? envelope.transcript_segments.map((segment) => `> [!quote] ${markdownInline(segment.speaker ?? "Unknown")} · ${markdownInline(segment.id)}\n${markdownQuote(segment.text)}`).join("\n\n")
    : "> 원문 전사 없음";
  const richSections = envelope.schema_version === "1.1" ? `

## Announcements

${jsonBlock("announcements", envelope.announcements)}

## Member updates

${jsonBlock("member-updates", envelope.member_updates)}

## Questions and answers

${jsonBlock("questions-and-answers", envelope.questions_and_answers)}

## Research ideas

${jsonBlock("research-ideas", envelope.research_ideas)}

## Presented papers

${jsonBlock("presented-papers", envelope.presented_papers)}
` : "";
  return `---
id: ${yamlString(receipt.note_id)}
type: meeting_record
schema_version: "1.0.0"
title: ${yamlString(envelope.title)}
curation_status: candidate
assertion_origin: machine_extracted
source_system: ${yamlString(envelope.source_system)}
external_meeting_id: ${yamlString(envelope.external_meeting_id)}
started_at: ${yamlString(envelope.started_at)}
submitted_at: ${yamlString(receipt.submitted_at)}
remote_receipt_id: ${yamlString(receipt.receipt_id)}
content_sha256: ${yamlString(receipt.content_sha256)}
---

# ${markdownInline(envelope.title)}

> [!warning] 검수 전 회의 후보
> 이 문서는 외부 회의 앱이 제출한 신뢰하지 않는 데이터입니다. 승인 전에는 PaperKG의 사실·관계로 사용하지 마십시오.

## Metadata

- Source: ${markdownInline(envelope.source_system)}
- Started: ${envelope.started_at}
- Ended: ${envelope.ended_at ?? "unknown"}
- Language: ${markdownInline(envelope.language)}
- Participants: ${participants || "unknown"}

## Summary

${envelope.summary ? markdownQuote(envelope.summary) : "요약 없음"}

## Topics

${envelope.topics.length ? envelope.topics.map((item) => `- ${markdownInline(item.label)}${item.entity_id ? ` ([[${item.entity_id}]])` : ""}`).join("\n") : "- 없음"}

## Decisions

${markdownList(envelope.decisions)}

## Action items

${envelope.action_items.length ? envelope.action_items.map((item) => `- [ ] ${markdownInline(item.text)} · owner=${markdownInline(item.owner ?? "unknown")} · due=${item.due_at ?? "unknown"} · status=${item.status}`).join("\n") : "- 없음"}

## Open questions

${markdownList(envelope.open_questions)}

## Requirements

${markdownList(envelope.requirements)}

## Risks

${envelope.risks.length ? envelope.risks.map((item) => `- [${item.severity}] ${markdownInline(item.text)}${item.mitigation ? ` · mitigation=${markdownInline(item.mitigation)}` : ""}`).join("\n") : "- 없음"}
${richSections}

## Transcript (untrusted source)

${transcript}
`;
}

function receiptJson(row: ReceiptRow, subjectSha256: string, replayed: boolean) {
  const curationStatus = row.local_sync_status === "not_imported" ? "candidate" : row.local_sync_status;
  return {
    receipt_id: row.receipt_id,
    note_id: row.note_id,
    note_path: row.note_path,
    content_sha256: row.content_sha256,
    subject_sha256: subjectSha256,
    status: row.status,
    submitted_at: row.submitted_at,
    replayed,
    curation_status: curationStatus,
    local_sync_status: row.local_sync_status,
    local_synced_at: row.local_synced_at,
    local_promoted_at: row.local_promoted_at,
    canonical_applied: row.local_sync_status === "promoted",
  };
}

async function existingReceipt(database: D1QuerySource, subjectSha256: string, idempotencySha256: string): Promise<ReceiptRow | null> {
  return database.prepare(`SELECT receipt_id, content_sha256, note_id, note_path, submitted_at, status, r2_json_key, r2_markdown_key, storage_state, local_sync_status, local_synced_at, local_promoted_at FROM meeting_receipts WHERE subject_sha256 = ? AND idempotency_key_sha256 = ?`)
    .bind(subjectSha256, idempotencySha256).first<ReceiptRow>();
}

function storageUnavailable(): Response {
  return privateJson(
    { error: "Candidate storage is temporarily unavailable", retryable: true },
    { status: 503, headers: { "retry-after": "5" } },
  );
}

function logMeetingStorageFailure(phase: string, error?: unknown): void {
  console.error(JSON.stringify({
    event: "meeting_candidate_storage_failure",
    phase,
    error_name: error instanceof Error ? error.name : error === undefined ? undefined : "unknown",
  }));
}

const STALE_PENDING_MEETING_MS = 24 * 60 * 60 * 1_000;

export type MeetingStorageHealth = "ready" | "backlog" | "unavailable";

export async function meetingStorageHealth(
  env: Pick<Env, "PAPERKG_DB">,
  nowMs = Date.now(),
): Promise<MeetingStorageHealth> {
  const cutoff = new Date(nowMs - STALE_PENDING_MEETING_MS).toISOString();
  try {
    const row = await env.PAPERKG_DB.withSession("first-primary").prepare(`
      SELECT COUNT(*) AS stale_count
      FROM meeting_receipts
      WHERE storage_state IN ('pending', 'purging') AND submitted_at <= ?
    `).bind(cutoff).first<{ stale_count: number }>();
    if (!row || !Number.isSafeInteger(row.stale_count) || row.stale_count < 0) {
      throw new Error("Meeting storage health query returned an invalid count");
    }
    return row.stale_count === 0 ? "ready" : "backlog";
  } catch (error) {
    logMeetingStorageFailure("health_check", error);
    return "unavailable";
  }
}

export async function purgeStaleMeetingIngestions(
  env: Pick<Env, "PAPERKG_DB" | "PAPERKG_STORAGE">,
  nowMs = Date.now(),
  requestedLimit = 100,
): Promise<{ claimed: number; deleted: number }> {
  const limit = Math.max(1, Math.min(requestedLimit, 100));
  const cutoff = new Date(nowMs - STALE_PENDING_MEETING_MS).toISOString();
  const database = env.PAPERKG_DB.withSession("first-primary");
  const claimed = await database.prepare(`
    UPDATE meeting_receipts
    SET storage_state = 'purging'
    WHERE receipt_id IN (
      SELECT receipt_id
      FROM meeting_receipts
      WHERE storage_state IN ('pending', 'purging') AND submitted_at <= ?
      ORDER BY submitted_at ASC
      LIMIT ?
    )
      AND storage_state IN ('pending', 'purging')
    RETURNING receipt_id, r2_json_key, r2_markdown_key
  `).bind(cutoff, limit).run<CleanupReceiptRow>();
  const rows = claimed.results;
  if (!rows.length) return { claimed: 0, deleted: 0 };

  try {
    await env.PAPERKG_STORAGE.delete(rows.flatMap((row) => [row.r2_json_key, row.r2_markdown_key]));
  } catch (error) {
    logMeetingStorageFailure("stale_r2_delete", error);
    throw error;
  }

  let deleted = 0;
  let deleteFailed = false;
  for (const row of rows) {
    try {
      const result = await database.prepare(`
        DELETE FROM meeting_receipts
        WHERE receipt_id = ? AND storage_state = 'purging'
      `).bind(row.receipt_id).run();
      if (result.success && result.meta.changes === 1) deleted += 1;
      else deleteFailed = true;
    } catch (error) {
      deleteFailed = true;
      logMeetingStorageFailure("stale_d1_delete", error);
    }
  }
  if (deleteFailed) throw new Error("One or more stale meeting receipt rows could not be deleted");
  return { claimed: rows.length, deleted };
}

async function submitMeeting(request: Request, env: Env, props: AuthProps): Promise<Response> {
  const denied = requireScope(props, "paperkg.meeting.submit");
  if (denied) return denied;
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return privateJson({ error: "Content-Type must be application/json" }, { status: 415 });
  }
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    return privateJson({ error: "Idempotency-Key must contain 8-200 characters" }, { status: 400 });
  }
  let raw: string;
  try {
    raw = await readBoundedRequestText(request, MAX_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return privateJson({ error: "Request body exceeds 12 MB" }, { status: 413 });
    return privateJson({ error: "Request body must be valid UTF-8" }, { status: 400 });
  }
  let decoded: unknown;
  try { decoded = JSON.parse(raw); } catch { return privateJson({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = meetingEnvelopeSchema.safeParse(decoded);
  if (!parsed.success) return privateJson({ error: "Invalid meeting envelope", issues: parsed.error.issues }, { status: 422 });
  const canonical = stable(parsed.data);
  const [subjectSha, idempotencySha, contentSha] = await Promise.all([sha256(props.userId), sha256(idempotencyKey), sha256(canonical)]);
  const database = env.PAPERKG_DB.withSession("first-primary");
  let persisted: ReceiptRow | null;
  try {
    persisted = await existingReceipt(database, subjectSha, idempotencySha);
  } catch (error) {
    logMeetingStorageFailure("initial_d1_read", error);
    return storageUnavailable();
  }
  if (persisted?.content_sha256 !== undefined && persisted.content_sha256 !== contentSha) {
    return privateJson({ error: "Idempotency conflict" }, { status: 409 });
  }
  if (persisted?.storage_state === "ready") {
    return privateJson(receiptJson(persisted, subjectSha, true));
  }
  if (persisted?.storage_state === "purging") {
    return storageUnavailable();
  }

  const submittedAt = persisted?.submitted_at ?? new Date().toISOString();
  const receiptId = `mi_${(await sha256(`${subjectSha}:${idempotencySha}:${contentSha}`)).slice(0, 32)}`;
  const noteId = `mtg_${(await sha256(`${parsed.data.source_system}:${parsed.data.external_meeting_id}:${contentSha}`)).slice(0, 24)}`;
  const notePath = `10_Inbox/Meetings/Remote/${noteId}.md`;
  const r2JsonKey = `meeting-candidates/${receiptId}.json`;
  const r2MarkdownKey = `meeting-candidates/${receiptId}.md`;
  let created = false;
  if (!persisted) {
    let inserted: D1Result;
    try {
      inserted = await database.prepare(`INSERT OR IGNORE INTO meeting_receipts (receipt_id, subject_sha256, idempotency_key_sha256, content_sha256, note_id, note_path, submitted_at, status, r2_json_key, r2_markdown_key, storage_state) VALUES (?, ?, ?, ?, ?, ?, ?, 'candidate', ?, ?, 'pending')`)
        .bind(receiptId, subjectSha, idempotencySha, contentSha, noteId, notePath, submittedAt, r2JsonKey, r2MarkdownKey).run();
    } catch (error) {
      logMeetingStorageFailure("pending_d1_insert", error);
      return storageUnavailable();
    }
    if (!inserted.success) {
      logMeetingStorageFailure("pending_d1_insert");
      return storageUnavailable();
    }
    created = inserted.meta.changes === 1;
    try {
      persisted = await existingReceipt(database, subjectSha, idempotencySha);
    } catch (error) {
      logMeetingStorageFailure("pending_d1_read", error);
      return storageUnavailable();
    }
  }
  if (!persisted) {
    logMeetingStorageFailure("pending_d1_missing");
    return storageUnavailable();
  }
  if (persisted.content_sha256 !== contentSha) {
    return privateJson({ error: "Idempotency conflict" }, { status: 409 });
  }
  if (persisted.storage_state === "ready") {
    return privateJson(receiptJson(persisted, subjectSha, !created), { status: created ? 201 : 200 });
  }
  if (persisted.storage_state === "purging") return storageUnavailable();

  const jsonPayload = JSON.stringify({ receipt: receiptJson(persisted, subjectSha, false), envelope: parsed.data });
  const markdownPayload = candidateMarkdown(parsed.data, persisted);
  const [jsonSha, markdownSha] = await Promise.all([sha256(jsonPayload), sha256(markdownPayload)]);
  try {
    await Promise.all([
      env.PAPERKG_STORAGE.put(persisted.r2_json_key, jsonPayload, {
        httpMetadata: { contentType: "application/json; charset=utf-8" },
        customMetadata: { receiptId: persisted.receipt_id, contentSha256: persisted.content_sha256 },
        sha256: jsonSha,
      }),
      env.PAPERKG_STORAGE.put(persisted.r2_markdown_key, markdownPayload, {
        httpMetadata: { contentType: "text/markdown; charset=utf-8" },
        customMetadata: { receiptId: persisted.receipt_id, contentSha256: persisted.content_sha256 },
        sha256: markdownSha,
      }),
    ]);
  } catch (error) {
    // Keep the pending receipt and any partial object. An identical retry repairs
    // both deterministic keys without racing a successful concurrent writer.
    logMeetingStorageFailure("r2_write", error);
    return storageUnavailable();
  }

  try {
    const finalized = await database.prepare(`
      UPDATE meeting_receipts
      SET storage_state = 'ready'
      WHERE receipt_id = ? AND content_sha256 = ? AND storage_state = 'pending'
    `).bind(persisted.receipt_id, contentSha).run();
    if (!finalized.success) {
      logMeetingStorageFailure("ready_d1_update");
      return storageUnavailable();
    }
    persisted = await existingReceipt(database, subjectSha, idempotencySha);
  } catch (error) {
    logMeetingStorageFailure("ready_d1_update", error);
    return storageUnavailable();
  }
  if (!persisted || persisted.storage_state !== "ready") return storageUnavailable();
  return privateJson(receiptJson(persisted, subjectSha, !created), { status: created ? 201 : 200 });
}

async function getReceipt(request: Request, env: Env, props: AuthProps, receiptId: string): Promise<Response> {
  const denied = requireScope(props, "paperkg.meeting.submit");
  if (denied) return denied;
  const subjectSha = await sha256(props.userId);
  const row = await env.PAPERKG_DB.withSession("first-primary").prepare(`SELECT receipt_id, content_sha256, note_id, note_path, submitted_at, status, r2_json_key, r2_markdown_key, storage_state, local_sync_status, local_synced_at, local_promoted_at FROM meeting_receipts WHERE receipt_id = ? AND subject_sha256 = ?`)
    .bind(receiptId, subjectSha).first<ReceiptRow>();
  if (!row) return privateJson({ error: "Receipt not found" }, { status: 404 });
  if (row.storage_state !== "ready") return storageUnavailable();
  return privateJson(receiptJson(row, subjectSha, false));
}

async function getNote(env: Env, props: AuthProps, id: string): Promise<Response> {
  const denied = requireScope(props, "paperkg.read");
  if (denied) return denied;
  const snapshot = await loadSnapshot(env);
  const note = noteByIdOrAlias(snapshot, decodeURIComponent(id));
  if (!note) return privateJson({ error: "Note not found" }, { status: 404 });
  return privateJson(publicNote(note, env.PUBLIC_BASE_URL, props.scopes.includes("paperkg.evidence.read")));
}

export async function handleProtectedApi(request: Request, env: Env, props: AuthProps): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (url.pathname === "/mcp/v1/meeting-ingestions" && request.method === "POST") return submitMeeting(request, env, props);
  const receiptMatch = url.pathname.match(/^\/mcp\/v1\/meeting-ingestions\/(mi_[a-f0-9]{32})$/);
  if (receiptMatch && request.method === "GET") return getReceipt(request, env, props, receiptMatch[1]!);
  const noteMatch = url.pathname.match(/^\/mcp\/v1\/notes\/([^/]+)$/);
  if (noteMatch && request.method === "GET") return getNote(env, props, noteMatch[1]!);
  return undefined;
}
