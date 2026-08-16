-- Migration 0006: Simple external destinations for the two mobile nav items.
ALTER TABLE platform_settings ADD COLUMN premium_apps_url TEXT NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN premium_apps_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE platform_settings ADD COLUMN youtube_external_url TEXT NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN youtube_external_enabled INTEGER NOT NULL DEFAULT 0;
