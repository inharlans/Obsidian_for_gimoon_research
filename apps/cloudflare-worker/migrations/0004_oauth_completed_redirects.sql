CREATE TABLE IF NOT EXISTS oauth_completed_redirects (
  browser_binding_hash TEXT PRIMARY KEY,
  encrypted_redirect TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_completed_redirects_expiry
  ON oauth_completed_redirects(expires_at_ms);
