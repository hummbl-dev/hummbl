-- Migration 006: Add workflow execution tables
-- Stores workflow execution history and task results

-- Create executions table
CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  input TEXT -- JSON string
);

-- Create execution_tasks table (individual task results)
CREATE TABLE IF NOT EXISTS execution_tasks (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  agent_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  output TEXT, -- JSON string
  error TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost REAL DEFAULT 0.0,
  started_at INTEGER,
  completed_at INTEGER,
  duration INTEGER -- milliseconds
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_tasks_execution_id ON execution_tasks(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_tasks_status ON execution_tasks(status);
