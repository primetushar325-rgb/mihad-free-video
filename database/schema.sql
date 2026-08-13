-- ============================================================
-- MIHAD FREE VIDEO - Full Database Schema (Cloudflare D1)
-- ============================================================
-- D1 is SQLite-compatible. This single file creates every table.
-- Run with: `npm run migrate`  (see scripts/migrate.ts)
-- ============================================================

-- ----------------------------------------------------------
-- Admins
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------
-- Categories
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  icon         TEXT    NOT NULL DEFAULT '',
  order_number INTEGER NOT NULL DEFAULT 0,
  is_visible   INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON categories (order_number);
CREATE INDEX IF NOT EXISTS idx_categories_visible ON categories (is_visible);

-- ----------------------------------------------------------
-- Videos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL DEFAULT '',
  thumbnail_url    TEXT    NOT NULL,
  google_drive_url TEXT    NOT NULL,
  tags             TEXT    NOT NULL DEFAULT '',          -- comma separated
  upload_time      TEXT    NOT NULL DEFAULT (datetime('now')),
  category_id      INTEGER,
  featured         INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos (featured);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos (created_at);

-- ----------------------------------------------------------
-- Slides (Hero Slider)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS slides (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url    TEXT    NOT NULL,
  title        TEXT    NOT NULL DEFAULT '',
  subtitle     TEXT    NOT NULL DEFAULT '',
  button_text  TEXT    NOT NULL DEFAULT '',
  button_link  TEXT    NOT NULL DEFAULT '',
  order_number INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_slides_order ON slides (order_number);

-- ----------------------------------------------------------
-- Settings (single row, id = 1)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id                     INTEGER PRIMARY KEY CHECK (id = 1),
  website_name           TEXT    NOT NULL DEFAULT 'Mihad Free Video',
  logo_url               TEXT    NOT NULL DEFAULT '',
  favicon_url            TEXT    NOT NULL DEFAULT '',
  footer_text            TEXT    NOT NULL DEFAULT '© Mihad Free Video. All rights reserved.',
  primary_color          TEXT    NOT NULL DEFAULT '#f5a623',
  secondary_color        TEXT    NOT NULL DEFAULT '#0a0a0a',
  enable_pwa             INTEGER NOT NULL DEFAULT 1,
  enable_ads             INTEGER NOT NULL DEFAULT 1,
  adsense_header         TEXT    NOT NULL DEFAULT '',
  adsense_between_cards  TEXT    NOT NULL DEFAULT '',
  adsense_details        TEXT    NOT NULL DEFAULT '',
  adsense_footer         TEXT    NOT NULL DEFAULT '',
  adsense_client         TEXT    NOT NULL DEFAULT '',  -- e.g. ca-pub-XXXXXXXX
  updated_at             TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Seed the single settings row if it does not exist.
INSERT OR IGNORE INTO settings (id) VALUES (1);

-- ----------------------------------------------------------
-- Visits (page view analytics)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT    NOT NULL DEFAULT '',
  page_path  TEXT    NOT NULL DEFAULT '',
  referrer   TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits (created_at);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits (visitor_id);

-- ----------------------------------------------------------
-- Downloads (per-video download analytics)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS downloads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT    NOT NULL DEFAULT '',
  video_id   INTEGER NOT NULL,
  video_title TEXT   NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_downloads_video ON downloads (video_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created ON downloads (created_at);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  prefs TEXT NOT NULL DEFAULT '{}',
  device TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_active TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subs (endpoint);

-- Notification records (history)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '/',
  target TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'sent',
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  event_id TEXT,
  schedule_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

-- Notification settings (global admin prefs)
CREATE TABLE IF NOT EXISTS notif_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  global_enabled INTEGER NOT NULL DEFAULT 1,
  new_videos INTEGER NOT NULL DEFAULT 1,
  new_tools INTEGER NOT NULL DEFAULT 1,
  new_templates INTEGER NOT NULL DEFAULT 1,
  new_updates INTEGER NOT NULL DEFAULT 1,
  announcements INTEGER NOT NULL DEFAULT 1,
  sound INTEGER NOT NULL DEFAULT 1,
  default_icon TEXT NOT NULL DEFAULT '/icons/icon-192.png',
  default_url TEXT NOT NULL DEFAULT '/'
);
INSERT OR IGNORE INTO notif_settings (id) VALUES (1);
