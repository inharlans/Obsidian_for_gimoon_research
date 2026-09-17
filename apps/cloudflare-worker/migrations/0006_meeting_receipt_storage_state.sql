ALTER TABLE meeting_receipts
  ADD COLUMN storage_state TEXT NOT NULL DEFAULT 'ready'
  CHECK (storage_state IN ('pending', 'ready', 'purging'));

CREATE INDEX IF NOT EXISTS idx_meeting_receipts_storage_state
  ON meeting_receipts(storage_state, submitted_at);
