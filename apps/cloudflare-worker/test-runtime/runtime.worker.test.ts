import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { meetingEnvelopeSchema, readBoundedRequestText, RequestBodyTooLargeError } from "../src/meeting.js";
import { oauthRecoveryConfigurationReady } from "../src/oauth-recovery.js";

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

describe("PaperKG in the Workers runtime", () => {
  it("imports and exercises AES-GCM with a shell-normalized recovery key", async () => {
    const key = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    await expect(oauthRecoveryConfigurationReady({ OAUTH_RECOVERY_KEY: `\ufeff${key}\r\n` })).resolves.toBe(true);
  });

  it("cancels a chunked request when the streaming byte limit is exceeded", async () => {
    const request = new Request("https://paperkg.example/upload", {
      method: "POST",
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("1234"));
          controller.enqueue(new TextEncoder().encode("5678"));
          controller.close();
        },
      }),
    });
    await expect(readBoundedRequestText(request, 6)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });

  it("accepts the hex SHA-256 and custom metadata used for deterministic R2 candidate writes", async () => {
    const key = `runtime-test/${crypto.randomUUID()}.json`;
    const body = JSON.stringify({ receipt_id: "mi_runtime" });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
    const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    try {
      const stored = await env.PAPERKG_STORAGE.put(key, body, {
        sha256: checksum,
        customMetadata: { receiptId: "mi_runtime", contentSha256: checksum },
      });
      expect(stored.checksums.sha256).not.toBeNull();
      const head = await env.PAPERKG_STORAGE.head(key);
      expect(head?.customMetadata).toEqual({ receiptId: "mi_runtime", contentSha256: checksum });
    } finally {
      await env.PAPERKG_STORAGE.delete(key);
    }
  });

  it("validates rich v1.1 references inside the Workers runtime", () => {
    const envelope = {
      schema_version: "1.1",
      external_meeting_id: "runtime-meeting",
      source_system: "seminar-app",
      title: "Runtime rich meeting",
      started_at: "2026-08-13T00:00:00+09:00",
      announcements: [{
        text: "Review the deck",
        transcript_segment_ids: ["segment-1"],
        slide_ids: ["slide-1"],
        paper_section_ids: ["paper-method"],
      }],
      transcript_segments: [{ id: "segment-1", text: "Review the deck" }],
    };
    expect(meetingEnvelopeSchema.safeParse(envelope).success).toBe(true);
    envelope.announcements[0]!.transcript_segment_ids = ["slide-1"];
    expect(meetingEnvelopeSchema.safeParse(envelope).success).toBe(false);
  });
});
