-- Migration 0004: Persist the admin-entered countdown duration for audit/preview.
-- Apply this once to databases created before duration_seconds was introduced.
ALTER TABLE giveaway_settings ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 0;
