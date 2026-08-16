-- Migration 0005: Apps, YouTube channels, news, external links and global platform controls.
CREATE TABLE IF NOT EXISTS premium_apps (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, icon_url TEXT NOT NULL DEFAULT '',
 description TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '', apk_url TEXT NOT NULL,
 page_url TEXT NOT NULL DEFAULT '', order_number INTEGER NOT NULL DEFAULT 0,
 enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_premium_apps_order ON premium_apps(enabled, order_number, id);
CREATE TABLE IF NOT EXISTS youtube_channels (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, logo_url TEXT NOT NULL DEFAULT '',
 description TEXT NOT NULL DEFAULT '', youtube_url TEXT NOT NULL, order_number INTEGER NOT NULL DEFAULT 0,
 enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_order ON youtube_channels(enabled, order_number, id);
CREATE TABLE IF NOT EXISTS news_posts (
 id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
 image_url TEXT NOT NULL DEFAULT '', youtube_url TEXT NOT NULL DEFAULT '', external_url TEXT NOT NULL DEFAULT '',
 topic TEXT NOT NULL DEFAULT '', publish_date TEXT NOT NULL DEFAULT (datetime('now')),
 enabled INTEGER NOT NULL DEFAULT 1, pinned INTEGER NOT NULL DEFAULT 0, order_number INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_news_feed ON news_posts(enabled, pinned, publish_date, order_number);
CREATE TABLE IF NOT EXISTS external_websites (
 id INTEGER PRIMARY KEY, name TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT '🌐',
 enabled INTEGER NOT NULL DEFAULT 0, order_number INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO external_websites(id, order_number) VALUES (1, 1);
INSERT OR IGNORE INTO external_websites(id, order_number) VALUES (2, 2);
CREATE TABLE IF NOT EXISTS platform_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), telegram_enabled INTEGER NOT NULL DEFAULT 0,
 telegram_url TEXT NOT NULL DEFAULT '', telegram_text TEXT NOT NULL DEFAULT 'Monetization Telegram',
 telegram_icon TEXT NOT NULL DEFAULT '✈️', telegram_position TEXT NOT NULL DEFAULT 'bottom-left',
 telegram_animation INTEGER NOT NULL DEFAULT 1, telegram_delay INTEGER NOT NULL DEFAULT 0,
 install_banner_enabled INTEGER NOT NULL DEFAULT 1, install_title TEXT NOT NULL DEFAULT 'Mihad Free Video',
 install_text TEXT NOT NULL DEFAULT 'Install our Android app for a faster experience',
 apk_url TEXT NOT NULL DEFAULT '/downloads/Mihad-Video.apk', web_install_enabled INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO platform_settings(id) VALUES(1);
