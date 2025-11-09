-- HUMMBL Production Database Schema
-- Complete schema with all tables for production readiness
-- Version: 2.0.0 (Production)
-- Date: 2025-11-08

-- ============================================
-- EXISTING TABLES (Keep from Phase 0)
-- ============================================

-- workflows table (existing)
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  agents TEXT NOT NULL,
  tasks TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- executions table (existing)
CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- task_results table (existing)
CREATE TABLE IF NOT EXISTS task_results (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL,
  result TEXT,
  error TEXT,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (execution_id) REFERENCES executions(id)
);

-- BaseN component registry (existing from pilot)
CREATE TABLE IF NOT EXISTS basen_components (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  transformation TEXT NOT NULL,
  description TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Component metrics (existing from pilot)
CREATE TABLE IF NOT EXISTS component_metrics (
  id TEXT PRIMARY KEY,
  component_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  metadata TEXT,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- User actions tracking (existing from pilot)
CREATE TABLE IF NOT EXISTS user_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  component_id TEXT,
  action TEXT NOT NULL,
  properties TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- ============================================
-- NEW TABLES FOR PRODUCTION
-- ============================================

-- ERROR TRACKING
CREATE TABLE IF NOT EXISTS errors (
  id TEXT PRIMARY KEY,
  execution_id TEXT,
  workflow_id TEXT,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity TEXT NOT NULL, -- low, medium, high, critical
  resolved INTEGER DEFAULT 0,
  resolved_at INTEGER,
  resolution_notes TEXT,
  context TEXT, -- JSON: { agent, task, model }
  created_at INTEGER NOT NULL,
  FOREIGN KEY (execution_id) REFERENCES executions(id),
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- TOKEN USAGE TRACKING
CREATE TABLE IF NOT EXISTS token_usage (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  agent_id TEXT,
  task_id TEXT,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd REAL NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (execution_id) REFERENCES executions(id),
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL, -- success, error, warning, info
  category TEXT NOT NULL, -- workflow, system, team, billing
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  read INTEGER DEFAULT 0,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);

-- API KEYS
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  service TEXT NOT NULL, -- anthropic, openai, custom
  key_encrypted TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- for verification without decryption
  usage_count INTEGER DEFAULT 0,
  last_used_at INTEGER,
  status TEXT DEFAULT 'active', -- active, expired, revoked
  created_at INTEGER NOT NULL
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer
  status TEXT DEFAULT 'invited', -- active, invited, suspended
  invited_by TEXT,
  joined_at INTEGER,
  last_active_at INTEGER,
  workflows_created INTEGER DEFAULT 0,
  executions_run INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- INVITES
CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  accepted INTEGER DEFAULT 0,
  accepted_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- SESSIONS
