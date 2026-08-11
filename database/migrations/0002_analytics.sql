-- Migration 0002: Analytics (visits + downloads)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS visits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT    NOT NULL DEFAULT '',
  page_path  TEXT    NOT NULL DEFAULT '',
  referrer   TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits (created_at);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits (visitor_id);

CREATE TABLE IF NOT EXISTS downloads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id  TEXT    NOT NULL DEFAULT '',
  video_id    INTEGER NOT NULL,
  video_title TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_downloads_video ON downloads (video_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created ON downloads (created_at);
