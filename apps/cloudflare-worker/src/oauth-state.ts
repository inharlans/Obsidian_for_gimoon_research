import type { Env } from "./types.js";

export type OAuthTransientStateKind = "consent" | "upstream";

interface OAuthTransientStateRow {
  payload: string;
  expires_at_ms: number;
}

function stateKey(kind: OAuthTransientStateKind, id: string): string {
  return `paperkg:${kind}:${id}`;
}

export async function putOAuthTransientState(
  env: Pick<Env, "PAPERKG_DB">,
  kind: OAuthTransientStateKind,
  id: string,
  payload: string,
  ttlSeconds: number,
  nowMs = Date.now(),
): Promise<void> {
  const expiresAtMs = nowMs + ttlSeconds * 1_000;
  await env.PAPERKG_DB.prepare(`
    INSERT INTO oauth_transient_states (state_key, payload, created_at_ms, expires_at_ms)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(state_key) DO UPDATE SET
      payload = excluded.payload,
      created_at_ms = excluded.created_at_ms,
      expires_at_ms = excluded.expires_at_ms
  `).bind(stateKey(kind, id), payload, nowMs, expiresAtMs).run();
  console.info(JSON.stringify({ event: "oauth_transient_state_stored", kind, ttl_seconds: ttlSeconds }));
}

export async function consumeOAuthTransientState(
  env: Pick<Env, "PAPERKG_DB">,
  kind: OAuthTransientStateKind,
  id: string,
  nowMs = Date.now(),
): Promise<string | null> {
  const key = stateKey(kind, id);
  const result = await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_transient_states
    WHERE state_key = ?
    RETURNING payload, expires_at_ms
  `).bind(key).run();
  const candidate = result.results[0] as OAuthTransientStateRow | undefined;
  if (!candidate) {
    console.info(JSON.stringify({ event: "oauth_transient_state_consumed", kind, outcome: "missing" }));
    return null;
  }
  if (candidate.expires_at_ms <= nowMs) {
    console.info(JSON.stringify({ event: "oauth_transient_state_consumed", kind, outcome: "expired" }));
    return null;
  }
  console.info(JSON.stringify({ event: "oauth_transient_state_consumed", kind, outcome: "consumed" }));
  return candidate.payload;
}

export async function purgeExpiredOAuthTransientState(
  env: Pick<Env, "PAPERKG_DB">,
  nowMs = Date.now(),
): Promise<void> {
  await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_transient_states
    WHERE expires_at_ms <= ?
  `).bind(nowMs).run();
  await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_callback_events
    WHERE created_at_ms <= ?
  `).bind(nowMs - 24 * 60 * 60 * 1_000).run();
  await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_reissue_authorizations
    WHERE expires_at_ms <= ?
  `).bind(nowMs).run();
}

export async function recordOAuthCallbackEvent(
  env: Pick<Env, "PAPERKG_DB">,
  stateFingerprint: string,
  phase: string,
  outcome: string,
  nowMs = Date.now(),
): Promise<void> {
  await env.PAPERKG_DB.prepare(`
    INSERT INTO oauth_callback_events (state_fingerprint, phase, outcome, created_at_ms)
    VALUES (?, ?, ?, ?)
  `).bind(stateFingerprint, phase, outcome, nowMs).run();
  console.info(JSON.stringify({ event: "oauth_callback", phase, outcome }));
}

export async function recordOAuthCallbackEventBestEffort(
  env: Pick<Env, "PAPERKG_DB">,
  stateFingerprint: string,
  phase: string,
  outcome: string,
  nowMs = Date.now(),
): Promise<boolean> {
  try {
    await recordOAuthCallbackEvent(env, stateFingerprint, phase, outcome, nowMs);
    return true;
  } catch (error) {
    console.error(JSON.stringify({
      event: "oauth_callback_audit_failure",
      phase,
      outcome,
      error_name: error instanceof Error ? error.name : "unknown",
    }));
    return false;
  }
}
