-- Backward-compatible WhatsApp support settings. Telegram fields remain for giveaway/legacy data.
ALTER TABLE platform_settings ADD COLUMN whatsapp_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE platform_settings ADD COLUMN whatsapp_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE platform_settings ADD COLUMN whatsapp_message TEXT NOT NULL DEFAULT 'Hello Mihad Free Video Support! I need help regarding your website.';
ALTER TABLE platform_settings ADD COLUMN whatsapp_position TEXT NOT NULL DEFAULT 'right';
ALTER TABLE platform_settings ADD COLUMN whatsapp_visible INTEGER NOT NULL DEFAULT 1;
ALTER TABLE platform_settings ADD COLUMN whatsapp_visibility TEXT NOT NULL DEFAULT 'all';
ALTER TABLE platform_settings ADD COLUMN whatsapp_tooltip TEXT NOT NULL DEFAULT 'Chat with support on WhatsApp';
