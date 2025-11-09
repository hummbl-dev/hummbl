-- Migration: 002_add_api_keys_table
-- Description: Add table for storing encrypted API keys per user/team
-- Created: 2025-11-09

-- API Keys table: Stores encrypted API keys for AI providers
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('anthropic', 'openai', 'custom')),
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_used_at INTEGER,
  UNIQUE(user_id, provider, key_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Record this migration
INSERT INTO schema_migrations (version, name, applied_at)
VALUES (2, '002_add_api_keys_table', strftime('%s', 'now'))
ON CONFLICT(version) DO NOTHING;
