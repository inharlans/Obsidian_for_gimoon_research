CREATE TABLE IF NOT EXISTS oauth_reissue_authorizations (
  request_hash TEXT PRIMARY KEY,
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_reissue_authorizations_expiry
  ON oauth_reissue_authorizations(expires_at_ms);
