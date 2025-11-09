/**
 * Migration Definitions
 * 
 * Import and define all database migrations
 * 
 * @module workers/migrations/index
 * @version 1.0.0
 */

import { Migration } from '../src/lib/migrations';
import fs from 'fs';
import path from 'path';

/**
 * Load migration from SQL file
 */
function loadMigration(version: number, name: string): Migration {
  const filename = `${String(version).padStart(3, '0')}_${name}.sql`;
  const filepath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filepath, 'utf-8');
  
  return {
    version,
    name,
    sql,
  };
}

/**
 * All migrations in order
 * Add new migrations here as they are created
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `-- Migration: 001_initial_schema
-- Description: Initial database schema with workflows, executions, and task_results tables

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'paused', 'completed', 'failed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_results (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  output TEXT,
  error TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_executions_workflow ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_task_results_execution ON task_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_task_results_status ON task_results(status);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at INTEGER NOT NULL
);

INSERT INTO schema_migrations (version, name, applied_at)
VALUES (1, '001_initial_schema', strftime('%s', 'now'))
ON CONFLICT(version) DO NOTHING;`,
  },
  {
    version: 2,
    name: 'add_api_keys_table',
    sql: `-- Migration: 002_add_api_keys_table
-- Description: Add table for storing encrypted API keys per user/team

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

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

INSERT INTO schema_migrations (version, name, applied_at)
VALUES (2, '002_add_api_keys_table', strftime('%s', 'now'))
ON CONFLICT(version) DO NOTHING;`,
  },
  {
    version: 3,
    name: 'add_users_table',
    sql: `-- Migration: 003_add_users_table
-- Description: Add users table for authentication and authorization

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'viewer')) DEFAULT 'user',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

INSERT INTO schema_migrations (version, name, applied_at)
VALUES (3, '003_add_users_table', strftime('%s', 'now'))
ON CONFLICT(version) DO NOTHING;`,
  },
];

export default migrations;
