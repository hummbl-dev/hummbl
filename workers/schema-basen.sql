-- HUMMBL BaseN Component Registry & Telemetry Schema
-- Phase: 3-Week Pilot (Day 1)
-- Purpose: Track components, metrics, and user actions for T4 (Observation)

-- BaseN Component Registry
CREATE TABLE IF NOT EXISTS basen_components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  route TEXT NOT NULL,
  transformations TEXT NOT NULL,  -- JSON array: ["T1", "T4"]
  version TEXT NOT NULL DEFAULT '1.0.0',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Component Metrics (T4 Observation)
CREATE TABLE IF NOT EXISTS component_metrics (
  id TEXT PRIMARY KEY,
  component_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL NOT NULL,
  metadata TEXT,  -- JSON: additional context
  user_id TEXT,
  session_id TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- User Actions (Telemetry)
CREATE TABLE IF NOT EXISTS user_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  component_id TEXT,
  payload TEXT,  -- JSON: action details
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- Token Usage Tracking (for analytics)
CREATE TABLE IF NOT EXISTS token_usage (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (execution_id) REFERENCES executions(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_component ON component_metrics(component_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON component_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_user ON component_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_session ON user_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON user_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_actions_component ON user_actions(component_id);

CREATE INDEX IF NOT EXISTS idx_tokens_execution ON token_usage(execution_id);
CREATE INDEX IF NOT EXISTS idx_tokens_agent ON token_usage(agent_id);
CREATE INDEX IF NOT EXISTS idx_tokens_timestamp ON token_usage(timestamp);

-- Seed initial components (6 existing pages)
INSERT OR IGNORE INTO basen_components (id, name, domain, route, transformations, version, enabled, created_at, updated_at)
VALUES 
  ('dashboard', 'Dashboard', 'core', '/', '["T1","T4"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now')),
  ('mental-models', 'Mental Models', 'knowledge', '/mental-models', '["T1"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now')),
  ('workflows', 'Workflows', 'orchestration', '/workflows', '["T3","T4"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now')),
  ('agents', 'Agents', 'orchestration', '/agents', '["T2"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now')),
  ('templates', 'Templates', 'knowledge', '/templates', '["T2"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now')),
  ('settings', 'Settings', 'config', '/settings', '["T1"]', '1.0.0', true, strftime('%s', 'now'), strftime('%s', 'now'));

-- Analytics queries for pilot evaluation
CREATE VIEW IF NOT EXISTS pilot_metrics_summary AS
SELECT 
  COUNT(DISTINCT component_id) as total_components,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) as total_actions,
  AVG(CASE WHEN metric_name = 'page_load_time' THEN value END) as avg_load_time,
  COUNT(CASE WHEN action_type = 'page_view' THEN 1 END) as total_page_views
FROM user_actions ua
LEFT JOIN component_metrics cm ON ua.component_id = cm.component_id
WHERE ua.timestamp > (strftime('%s', 'now') - 1814400);  -- Last 21 days (pilot period)
