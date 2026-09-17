import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it } from "vitest";
import {
  handleProtectedApi,
  purgeStaleMeetingIngestions,
  readBoundedRequestText,
  RequestBodyTooLargeError,
} from "../src/meeting.js";
import type { AuthProps, Env } from "../src/types.js";

interface StoredReceipt {
  receipt_id: string;
  subject_sha256: string;
  idempotency_key_sha256: string;
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

interface FakeControls {
  failD1Insert: boolean;
  failD1ReadyUpdate: boolean;
  failR2JsonPut: boolean;
  failR2MarkdownPut: boolean;
  failR2Delete: boolean;
}

function fakeBindings(overrides: Partial<FakeControls> = {}) {
  const rows: StoredReceipt[] = [];
  const objects = new Map<string, string>();
  const controls: FakeControls = {
    failD1Insert: false,
    failD1ReadyUpdate: false,
    failR2JsonPut: false,
    failR2MarkdownPut: false,
    failR2Delete: false,
    ...overrides,
  };
  const database = {
    withSession(constraint: string) {
      if (constraint !== "first-primary") throw new Error(`Unexpected D1 session constraint: ${constraint}`);
      return database;
    },
    prepare(sql: string) {
      let values: unknown[] = [];
      const statement = {
        bind(...input: unknown[]) {
          values = input;
          return statement;
        },
        async first<T>() {
          if (sql.includes("subject_sha256 = ? AND idempotency_key_sha256 = ?")) {
            const [subject, idempotency] = values;
            return (rows.find((row) => row.subject_sha256 === subject && row.idempotency_key_sha256 === idempotency) ?? null) as T | null;
          }
          if (sql.includes("receipt_id = ? AND subject_sha256 = ?")) {
            const [receiptId, subject] = values;
            return (rows.find((row) => row.receipt_id === receiptId && row.subject_sha256 === subject) ?? null) as T | null;
          }
          throw new Error(`Unexpected D1 first query: ${sql}`);
        },
        async run() {
          if (sql.startsWith("INSERT OR IGNORE INTO meeting_receipts")) {
            if (controls.failD1Insert) throw new Error("simulated D1 insert failure");
            const [receiptId, subject, idempotency, content, noteId, notePath, submittedAt, r2JsonKey, r2MarkdownKey] = values as string[];
            const created = !rows.some((row) => row.subject_sha256 === subject && row.idempotency_key_sha256 === idempotency);
            if (created) {
              rows.push({
                receipt_id: receiptId!,
                subject_sha256: subject!,
                idempotency_key_sha256: idempotency!,
                content_sha256: content!,
                note_id: noteId!,
                note_path: notePath!,
                submitted_at: submittedAt!,
                status: "candidate",
                r2_json_key: r2JsonKey!,
                r2_markdown_key: r2MarkdownKey!,
                storage_state: "pending",
                local_sync_status: "not_imported",
                local_synced_at: null,
                local_promoted_at: null,
              });
            }
            return { success: true, results: [], meta: { changes: created ? 1 : 0 } };
          }
          if (sql.includes("SET storage_state = 'ready'")) {
            if (controls.failD1ReadyUpdate) throw new Error("simulated D1 ready update failure");
            const [receiptId, content] = values;
            const row = rows.find((candidate) => candidate.receipt_id === receiptId
              && candidate.content_sha256 === content && candidate.storage_state === "pending");
            if (row) row.storage_state = "ready";
            return { success: true, results: [], meta: { changes: row ? 1 : 0 } };
          }
          if (sql.includes("SET storage_state = 'purging'")) {
            const [cutoff, limit] = values as [string, number];
            const claimed = rows
              .filter((row) => ["pending", "purging"].includes(row.storage_state) && row.submitted_at <= cutoff)
              .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at))
              .slice(0, limit);
            for (const row of claimed) row.storage_state = "purging";
            return {
              success: true,
              results: claimed.map(({ receipt_id, r2_json_key, r2_markdown_key }) => ({ receipt_id, r2_json_key, r2_markdown_key })),
              meta: { changes: claimed.length },
            };
          }
          if (sql.includes("DELETE FROM meeting_receipts")) {
            const [receiptId] = values;
            const index = rows.findIndex((row) => row.receipt_id === receiptId && row.storage_state === "purging");
            if (index >= 0) rows.splice(index, 1);
            return { success: true, results: [], meta: { changes: index >= 0 ? 1 : 0 } };
          }
          throw new Error(`Unexpected D1 run query: ${sql}`);
        },
      };
      return statement;
    },
  };
  const storage = {
    async put(key: string, value: string) {
      if (controls.failR2JsonPut && key.endsWith(".json")) throw new Error("simulated R2 JSON failure");
      if (controls.failR2MarkdownPut && key.endsWith(".md")) throw new Error("simulated R2 Markdown failure");
      objects.set(key, value);
      return null;
    },
    async delete(keys: string | string[]) {
      if (controls.failR2Delete) throw new Error("simulated R2 delete failure");
      for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key);
    },
  };
  return {
    env: { PAPERKG_DB: database, PAPERKG_STORAGE: storage } as unknown as Env,
    rows,
    objects,
    controls,
  };
}

async function responseOf(request: Request, env: Env, props: AuthProps): Promise<Response> {
  const response = await handleProtectedApi(request, env, props);
  if (!response) throw new Error(`Worker did not route ${request.method} ${request.url}`);
  return response;
}

describe("Cloudflare meeting candidate API", () => {
  let envelope: Record<string, unknown>;

  beforeEach(async () => {
    envelope = JSON.parse(await readFile(new URL("../../../fixtures/meeting-ingestion/seminar-app-v1.json", import.meta.url), "utf8")) as Record<string, unknown>;
  });

  it("stops reading a chunked request as soon as its byte limit is exceeded", async () => {
    const request = new Request("https://paperkg.example/upload", {
      method: "POST",
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("1234"));
          controller.enqueue(new TextEncoder().encode("5678"));
          controller.close();
        },
      }),
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readBoundedRequestText(request, 6)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });

  it("requires the narrow meeting submission scope before touching storage", async () => {
    const { env, rows, objects } = fakeBindings();
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-fixture-v1" },
      body: JSON.stringify(envelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.read"] });

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "insufficient_scope", required_scope: "paperkg.meeting.submit" });
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("rejects non-JSON content before reading or storing it", async () => {
    const { env, rows, objects } = fakeBindings();
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "text/plain", "idempotency-key": "seminar-content-type-v1" },
      body: JSON.stringify(envelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(415);
    expect(await response.json()).toMatchObject({ error: "Content-Type must be application/json" });
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("does not create R2 objects when the durable pending receipt cannot be inserted", async () => {
    const { env, rows, objects } = fakeBindings({ failD1Insert: true });
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-d1-failure-v1" },
      body: JSON.stringify(envelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("5");
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("repairs a partial R2 write on an identical idempotent retry", async () => {
    const { env, rows, objects, controls } = fakeBindings({ failR2JsonPut: true });
    const owner: AuthProps = { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] };
    const submit = () => responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-r2-repair-v1" },
      body: JSON.stringify(envelope),
    }), env, owner);

    const failed = await submit();
    expect(failed.status).toBe(503);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.storage_state).toBe("pending");
    expect(objects.size).toBe(1);

    controls.failR2JsonPut = false;
    const repaired = await submit();
    expect(repaired.status).toBe(200);
    expect(await repaired.json()).toMatchObject({ status: "candidate", replayed: true });
    expect(rows[0]!.storage_state).toBe("ready");
    expect(objects.size).toBe(2);
    const storedJson = JSON.parse(objects.get(rows[0]!.r2_json_key) ?? "{}") as { receipt?: { submitted_at?: string } };
    expect(storedJson.receipt?.submitted_at).toBe(rows[0]!.submitted_at);
  });

  it("repairs R2 objects left behind by a transient D1 ready-transition failure", async () => {
    const { env, rows, objects, controls } = fakeBindings({ failD1ReadyUpdate: true });
    const owner: AuthProps = { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] };
    const submit = () => responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-d1-finalize-repair-v1" },
      body: JSON.stringify(envelope),
    }), env, owner);

    expect((await submit()).status).toBe(503);
    expect(rows[0]!.storage_state).toBe("pending");
    expect(objects.size).toBe(2);

    controls.failD1ReadyUpdate = false;
    expect((await submit()).status).toBe(200);
    expect(rows[0]!.storage_state).toBe("ready");
    expect(objects.size).toBe(2);
  });

  it("purges only stale unfinished receipt state and its deterministic R2 keys", async () => {
    const { env, rows, objects, controls } = fakeBindings({ failR2JsonPut: true });
    const owner: AuthProps = { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] };
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-stale-pending-v1" },
      body: JSON.stringify(envelope),
    }), env, owner);
    expect(response.status).toBe(503);
    rows[0]!.submitted_at = "2026-08-10T00:00:00.000Z";
    controls.failR2JsonPut = false;

    const ready = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-ready-old-v1" },
      body: JSON.stringify(envelope),
    }), env, owner);
    expect(ready.status).toBe(201);
    rows[1]!.submitted_at = "2026-08-10T00:00:00.000Z";

    await expect(purgeStaleMeetingIngestions(env, Date.parse("2026-08-12T00:00:01.000Z"))).resolves.toEqual({ claimed: 1, deleted: 1 });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.storage_state).toBe("ready");
    expect(objects.size).toBe(2);
  });

  it("keeps a claimed stale receipt for retry when R2 cleanup fails", async () => {
    const { env, rows, objects, controls } = fakeBindings({ failR2JsonPut: true });
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-stale-delete-retry-v1" },
      body: JSON.stringify(envelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });
    expect(response.status).toBe(503);
    rows[0]!.submitted_at = "2026-08-10T00:00:00.000Z";
    controls.failR2Delete = true;

    await expect(purgeStaleMeetingIngestions(env, Date.parse("2026-08-12T00:00:01.000Z"))).rejects.toThrow("simulated R2 delete failure");
    expect(rows[0]!.storage_state).toBe("purging");
    expect(objects.size).toBe(1);

    controls.failR2Delete = false;
    await expect(purgeStaleMeetingIngestions(env, Date.parse("2026-08-12T00:00:02.000Z"))).resolves.toEqual({ claimed: 1, deleted: 1 });
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("stores a candidate, replays it idempotently, rejects conflicts, and isolates receipts by subject", async () => {
    const { env, rows, objects } = fakeBindings();
    const owner: AuthProps = { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] };
    const submit = (body: Record<string, unknown>) => responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-fixture-v1" },
      body: JSON.stringify(body),
    }), env, owner);

    const created = await submit(envelope);
    expect(created.status).toBe(201);
    const receipt = await created.json() as { receipt_id: string; note_id: string; status: string; replayed: boolean };
    expect(receipt).toMatchObject({
      status: "candidate", replayed: false, curation_status: "candidate", local_sync_status: "not_imported",
      local_synced_at: null, local_promoted_at: null, canonical_applied: false,
    });
    expect(receipt.receipt_id).toMatch(/^mi_[a-f0-9]{32}$/);
    expect(receipt.note_id).toMatch(/^mtg_[a-f0-9]{24}$/);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.storage_state).toBe("ready");
    expect(objects.size).toBe(2);
    expect(objects.get(`meeting-candidates/${receipt.receipt_id}.md`)).toContain("curation_status: candidate");
    expect(objects.get(`meeting-candidates/${receipt.receipt_id}.json`)).toContain('"source_system":"seminar-app"');

    const replay = await submit(envelope);
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ receipt_id: receipt.receipt_id, replayed: true });
    expect(rows).toHaveLength(1);
    expect(objects.size).toBe(2);

    const conflict = await submit({ ...envelope, title: "Changed title under the same key" });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ error: "Idempotency conflict" });

    const owned = await responseOf(new Request(`https://paperkg.example/mcp/v1/meeting-ingestions/${receipt.receipt_id}`), env, owner);
    expect(owned.status).toBe(200);
    expect(await owned.json()).toMatchObject({ receipt_id: receipt.receipt_id, status: "candidate" });

    const otherSubject = await responseOf(
      new Request(`https://paperkg.example/mcp/v1/meeting-ingestions/${receipt.receipt_id}`),
      env,
      { userId: "owner-2", login: "other", scopes: ["paperkg.meeting.submit"] },
    );
    expect(otherSubject.status).toBe(404);
  });

  it("reports exactly one create under a concurrent identical submission race", async () => {
    const { env, rows } = fakeBindings();
    const owner: AuthProps = { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] };
    const submit = () => responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-concurrent-v1" },
      body: JSON.stringify(envelope),
    }), env, owner);

    const responses = await Promise.all([submit(), submit()]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 201]);
    const receipts = await Promise.all(responses.map((response) => response.json() as Promise<{ replayed: boolean }>));
    expect(receipts.map((receipt) => receipt.replayed).sort()).toEqual([false, true]);
    expect(rows).toHaveLength(1);
  });

  it("renders untrusted meeting text without allowing Markdown structure or HTML injection", async () => {
    const { env, objects } = fakeBindings();
    const unsafe = {
      ...envelope,
      title: "Meeting\n# forged heading <iframe src=https://evil.example>",
      language: "ko\n# forged language",
      summary: "![](https://evil.example/pixel)\n> [!danger] forged callout",
      topics: [{ label: "Topic\n- forged list" }],
    };
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-markdown-safety-v1" },
      body: JSON.stringify(unsafe),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(201);
    const receipt = await response.json() as { receipt_id: string };
    const markdown = objects.get(`meeting-candidates/${receipt.receipt_id}.md`) ?? "";
    const renderedBody = markdown.split("---", 3)[2] ?? "";
    expect(renderedBody).not.toContain("<iframe");
    expect(renderedBody).not.toContain("![](https://evil.example/pixel)");
    expect(renderedBody).not.toContain("\n# forged heading");
    expect(renderedBody).not.toContain("\n# forged language");
    expect(renderedBody).toContain("&lt;iframe");
    expect(renderedBody).toContain("\\!\\[\\](https://evil.example/pixel)");
  });

  it("returns schema issues without creating a receipt", async () => {
    const { env, rows, objects } = fakeBindings();
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-invalid-v1" },
      body: JSON.stringify({ ...envelope, schema_version: "2.0" }),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: "Invalid meeting envelope" });
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });

  it("stores the v1.1 rich fields without confusing slides or paper sections with transcript segments", async () => {
    const richEnvelope = JSON.parse(await readFile(new URL("../../../fixtures/meeting-ingestion/seminar-app-v1.1.json", import.meta.url), "utf8")) as Record<string, unknown>;
    const { env, rows, objects } = fakeBindings();
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-rich-fixture-v11" },
      body: JSON.stringify(richEnvelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(201);
    const receipt = await response.json() as { receipt_id: string };
    const stored = JSON.parse(objects.get(`meeting-candidates/${receipt.receipt_id}.json`) ?? "{}") as { envelope?: Record<string, unknown> };
    expect(stored.envelope).toMatchObject({
      schema_version: "1.1",
      announcements: [expect.objectContaining({ slide_ids: ["slide-39"], transcript_segment_ids: ["revision-080"] })],
      member_updates: [expect.objectContaining({ next_steps: ["세 가지 task order로 민감도 실험 실행"] })],
      questions_and_answers: expect.arrayContaining([expect.objectContaining({ status: "answered" }), expect.objectContaining({ status: "unresolved" })]),
      research_ideas: [expect.objectContaining({ title: "Task-order robust continual merging" })],
      presented_papers: [expect.objectContaining({ paper_section_ids: ["paper-method", "paper-ablation", "paper-limitations"] })],
    });
    expect(rows).toHaveLength(1);

    const badEnvelope = structuredClone(richEnvelope);
    const announcements = badEnvelope.announcements as Array<Record<string, unknown>>;
    announcements[0]!.transcript_segment_ids = ["slide-39"];
    const rejected = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-rich-invalid-v11" },
      body: JSON.stringify(badEnvelope),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });
    expect(rejected.status).toBe(422);
    expect(rows).toHaveLength(1);
  });

  it("caps arbitrary metadata entries", async () => {
    const { env, rows, objects } = fakeBindings();
    const metadata = Object.fromEntries(Array.from({ length: 201 }, (_, index) => [`key-${index}`, index]));
    const response = await responseOf(new Request("https://paperkg.example/mcp/v1/meeting-ingestions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "seminar-metadata-limit-v1" },
      body: JSON.stringify({ ...envelope, metadata }),
    }), env, { userId: "owner-1", login: "owner", scopes: ["paperkg.meeting.submit"] });

    expect(response.status).toBe(422);
    expect(rows).toHaveLength(0);
    expect(objects.size).toBe(0);
  });
});
