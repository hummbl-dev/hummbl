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
  created_by TEXT, -- Added for team management
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
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

-- WORKFLOW SHARING
CREATE TABLE IF NOT EXISTS workflow_sharing (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  shared_with_user_id TEXT NOT NULL,
  shared_by_user_id TEXT NOT NULL,
  permission_level TEXT DEFAULT 'view',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id)
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
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at INTEGER NOT NULL,
  last_activity INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_task_results_execution ON task_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_components_code ON basen_components(code);
CREATE INDEX IF NOT EXISTS idx_metrics_component ON component_metrics(component_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON component_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_actions_component ON user_actions(component_id);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON user_actions(timestamp);

-- New indexes for errors
CREATE INDEX IF NOT EXISTS idx_errors_execution ON errors(execution_id);
CREATE INDEX IF NOT EXISTS idx_errors_workflow ON errors(workflow_id);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON errors(severity);
CREATE INDEX IF NOT EXISTS idx_errors_resolved ON errors(resolved);
CREATE INDEX IF NOT EXISTS idx_errors_created ON errors(created_at);

-- New indexes for token usage
CREATE INDEX IF NOT EXISTS idx_tokens_execution ON token_usage(execution_id);
CREATE INDEX IF NOT EXISTS idx_tokens_workflow ON token_usage(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tokens_model ON token_usage(model);
CREATE INDEX IF NOT EXISTS idx_tokens_agent ON token_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_tokens_created ON token_usage(created_at);

-- New indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- New indexes for API keys
CREATE INDEX IF NOT EXISTS idx_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_keys_hash ON api_keys(key_hash);

-- New indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- New indexes for invites
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_accepted ON invites(accepted);

-- New indexes for workflow_sharing
CREATE INDEX IF NOT EXISTS idx_sharing_workflow ON workflow_sharing(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sharing_shared_with ON workflow_sharing(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_shared_by ON workflow_sharing(shared_by_user_id);

-- New indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- SEED DATA (Development Only)
-- ============================================

-- Insert default user (owner)
INSERT OR IGNORE INTO users (id, email, name, role, status, joined_at, created_at)
VALUES (
  'user-default',
  'admin@hummbl.io',
  'HUMMBL Admin',
  'owner',
  'active',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);

-- Insert sample BaseN components (if not already exist)
INSERT OR IGNORE INTO basen_components (id, code, name, version, transformation, description, created_at, updated_at)
VALUES 
  ('comp-analytics', 'AN1', 'Analytics Dashboard', '1.0.0', 'T4', 'Real-time analytics and metrics', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-tokens', 'TK1', 'Token Usage', '1.0.0', 'T4', 'Token consumption tracking', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-monitor', 'EX1', 'Execution Monitor', '1.0.0', 'T4', 'Workflow execution monitoring', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-errors', 'ER1', 'Error Logs', '1.0.0', 'T4', 'Error tracking and debugging', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-team', 'TM1', 'Team Members', '1.0.0', 'T2', 'Team collaboration', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-keys', 'KY1', 'API Keys', '1.0.0', 'T1', 'API key management', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-notifications', 'NT1', 'Notifications', '1.0.0', 'T4', 'User notifications', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
  ('comp-telemetry', 'TL1', 'Telemetry', '1.0.0', 'T4', 'Telemetry infrastructure', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
