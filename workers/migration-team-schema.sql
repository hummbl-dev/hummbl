-- Add created_by column to workflows table
ALTER TABLE workflows ADD COLUMN created_by TEXT REFERENCES users(id);

-- Create workflow_sharing table with correct column names
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

-- Create indexes for workflow_sharing
CREATE INDEX IF NOT EXISTS idx_sharing_workflow ON workflow_sharing(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sharing_shared_with ON workflow_sharing(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_shared_by ON workflow_sharing(shared_by_user_id);
