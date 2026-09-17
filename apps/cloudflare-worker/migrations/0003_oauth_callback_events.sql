CREATE TABLE IF NOT EXISTS oauth_callback_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_fingerprint TEXT NOT NULL,
  phase TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_callback_events_state
  ON oauth_callback_events(state_fingerprint, created_at_ms);

CREATE INDEX IF NOT EXISTS idx_oauth_callback_events_expiry
  ON oauth_callback_events(created_at_ms);
