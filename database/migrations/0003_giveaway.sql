-- Migration 0003: Admin-controlled giveaway and privacy-minimal participation records.

CREATE TABLE IF NOT EXISTS giveaway_settings (
  id                       INTEGER PRIMARY KEY CHECK (id = 1),
  enabled                  INTEGER NOT NULL DEFAULT 0,
  floating_button_enabled  INTEGER NOT NULL DEFAULT 1,
  title                    TEXT NOT NULL DEFAULT 'YouTube Channel Giveaway',
  subscriber_count         INTEGER NOT NULL DEFAULT 7056,
  youtube_url              TEXT NOT NULL DEFAULT '',
  facebook_url             TEXT NOT NULL DEFAULT '',
  telegram_url             TEXT NOT NULL DEFAULT '',
  description              TEXT NOT NULL DEFAULT 'Win a YouTube Channel!',
  start_time               TEXT,
  end_time                 TEXT,
  button_position          TEXT NOT NULL DEFAULT 'bottom-right',
  giveaway_version         INTEGER NOT NULL DEFAULT 1,
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO giveaway_settings (id) VALUES (1);

CREATE TABLE IF NOT EXISTS giveaway_participants (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  giveaway_version   INTEGER NOT NULL,
  visitor_id         TEXT NOT NULL,
  name               TEXT NOT NULL,
  email              TEXT NOT NULL DEFAULT '',
  facebook_completed INTEGER NOT NULL DEFAULT 0,
  telegram_completed INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (giveaway_version, visitor_id)
);
CREATE INDEX IF NOT EXISTS idx_giveaway_participants_version
  ON giveaway_participants (giveaway_version, created_at);
