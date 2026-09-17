CREATE TABLE IF NOT EXISTS oauth_transient_states (
  state_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_transient_states_expiry
  ON oauth_transient_states(expires_at_ms);
