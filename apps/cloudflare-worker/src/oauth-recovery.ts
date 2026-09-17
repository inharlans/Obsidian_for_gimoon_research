import type { Env } from "./types.js";

interface CompletedRedirectRow {
  encrypted_redirect: string;
  iv: string;
  expires_at_ms: number;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function importRecoveryKey(encodedKey: string): Promise<CryptoKey> {
  // Wrangler's stdin-based secret setup can preserve a trailing newline or BOM,
  // depending on the invoking shell. Neither is part of the base64url key.
  const raw = decodeBase64Url(encodedKey.trim());
  if (raw.byteLength !== 32) throw new Error("OAUTH_RECOVERY_KEY must contain exactly 32 bytes");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function oauthRecoveryConfigurationReady(
  env: Pick<Env, "OAUTH_RECOVERY_KEY">,
): Promise<boolean> {
  try {
    const key = await importRecoveryKey(env.OAUTH_RECOVERY_KEY);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode("paperkg-recovery-self-check");
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return new TextDecoder().decode(decrypted) === "paperkg-recovery-self-check";
  } catch {
    return false;
  }
}

export async function storeCompletedOAuthRedirect(
  env: Pick<Env, "PAPERKG_DB" | "OAUTH_RECOVERY_KEY">,
  browserBindingHash: string,
  redirectTo: string,
  ttlSeconds: number,
  nowMs = Date.now(),
): Promise<void> {
  const key = await importRecoveryKey(env.OAUTH_RECOVERY_KEY);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(redirectTo),
  );
  await env.PAPERKG_DB.prepare(`
    INSERT INTO oauth_completed_redirects (
      browser_binding_hash, encrypted_redirect, iv, created_at_ms, expires_at_ms
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(browser_binding_hash) DO UPDATE SET
      encrypted_redirect = excluded.encrypted_redirect,
      iv = excluded.iv,
      created_at_ms = excluded.created_at_ms,
      expires_at_ms = excluded.expires_at_ms
  `).bind(
    browserBindingHash,
    encodeBase64Url(new Uint8Array(encrypted)),
    encodeBase64Url(iv),
    nowMs,
    nowMs + ttlSeconds * 1_000,
  ).run();
}

export async function storeCompletedOAuthRedirectBestEffort(
  env: Pick<Env, "PAPERKG_DB" | "OAUTH_RECOVERY_KEY">,
  browserBindingHash: string,
  redirectTo: string,
  ttlSeconds: number,
  nowMs = Date.now(),
): Promise<boolean> {
  try {
    await storeCompletedOAuthRedirect(env, browserBindingHash, redirectTo, ttlSeconds, nowMs);
    return true;
  } catch (error) {
    console.error(JSON.stringify({
      event: "oauth_redirect_recovery_store_failure",
      error_name: error instanceof Error ? error.name : "unknown",
    }));
    return false;
  }
}

export async function consumeCompletedOAuthRedirect(
  env: Pick<Env, "PAPERKG_DB" | "OAUTH_RECOVERY_KEY">,
  browserBindingHash: string,
  nowMs = Date.now(),
): Promise<string | null> {
  const result = await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_completed_redirects
    WHERE browser_binding_hash = ?
    RETURNING encrypted_redirect, iv, expires_at_ms
  `).bind(browserBindingHash).run();
  const row = result.results[0] as CompletedRedirectRow | undefined;
  if (!row || row.expires_at_ms <= nowMs) return null;
  const key = await importRecoveryKey(env.OAUTH_RECOVERY_KEY);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64Url(row.iv) },
    key,
    decodeBase64Url(row.encrypted_redirect),
  );
  return new TextDecoder().decode(decrypted);
}

export async function purgeExpiredCompletedOAuthRedirects(
  env: Pick<Env, "PAPERKG_DB">,
  nowMs = Date.now(),
): Promise<void> {
  await env.PAPERKG_DB.prepare(`
    DELETE FROM oauth_completed_redirects
    WHERE expires_at_ms <= ?
  `).bind(nowMs).run();
}
