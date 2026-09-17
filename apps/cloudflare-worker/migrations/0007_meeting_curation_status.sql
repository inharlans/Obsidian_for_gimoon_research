ALTER TABLE meeting_receipts
  ADD COLUMN local_sync_status TEXT NOT NULL DEFAULT 'not_imported'
  CHECK (local_sync_status IN ('not_imported', 'needs_review', 'promoted', 'rejected'));

ALTER TABLE meeting_receipts
  ADD COLUMN local_synced_at TEXT;

ALTER TABLE meeting_receipts
  ADD COLUMN local_promoted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_meeting_receipts_local_sync_status
  ON meeting_receipts(local_sync_status, submitted_at);
