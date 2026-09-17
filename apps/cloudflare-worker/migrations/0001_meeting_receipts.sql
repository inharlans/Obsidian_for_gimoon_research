CREATE TABLE IF NOT EXISTS meeting_receipts (
  receipt_id TEXT PRIMARY KEY,
  subject_sha256 TEXT NOT NULL,
  idempotency_key_sha256 TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  note_id TEXT NOT NULL,
  note_path TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status = 'candidate'),
  r2_json_key TEXT NOT NULL,
  r2_markdown_key TEXT NOT NULL,
  UNIQUE(subject_sha256, idempotency_key_sha256)
);

CREATE INDEX IF NOT EXISTS idx_meeting_receipts_subject
  ON meeting_receipts(subject_sha256, submitted_at DESC);
