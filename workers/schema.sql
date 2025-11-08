-- HUMMBL Workflows Database Schema
-- D1 (SQLite) Schema for workflow execution tracking
-- Compatible with Cloudflare D1
-- Execute: wrangler d1 execute hummbl-workflows --file=./schema.sql

-- Drop tables if exist (for clean redeployment)
DROP TABLE IF EXISTS task_results;
DROP TABLE IF EXISTS executions;
DROP TABLE IF EXISTS workflows;

-- Workflows table: Stores workflow definitions
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'paused', 'completed', 'failed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Executions table: Tracks workflow execution instances
CREATE TABLE executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Task results table: Stores individual task execution results
CREATE TABLE task_results (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  output TEXT,
  error TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

-- Indexes for query performance
CREATE INDEX idx_executions_workflow ON executions(workflow_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_task_results_execution ON task_results(execution_id);
CREATE INDEX idx_task_results_status ON task_results(status);

-- Sample data (optional, for testing)
-- INSERT INTO workflows (id, name, description, status, created_at, updated_at)
-- VALUES ('test-workflow-1', 'Test Workflow', 'Sample workflow for testing', 'active', 
--         strftime('%s', 'now'), strftime('%s', 'now'));
