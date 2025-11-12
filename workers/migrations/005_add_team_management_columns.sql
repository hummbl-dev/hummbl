-- Migration 005: Add team management columns to users table
-- Adds columns needed for team member management UI

-- Add status column (active, invited, suspended)
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';

-- Add invited_by column (user ID who invited this user)
ALTER TABLE users ADD COLUMN invited_by TEXT;

-- Add joined_at column (when user accepted invitation)
ALTER TABLE users ADD COLUMN joined_at INTEGER;

-- Add last_active_at column (last time user was active)
ALTER TABLE users ADD COLUMN last_active_at INTEGER;

-- Add workflows_created counter
ALTER TABLE users ADD COLUMN workflows_created INTEGER DEFAULT 0;

-- Add executions_run counter
ALTER TABLE users ADD COLUMN executions_run INTEGER DEFAULT 0;

-- Update existing users to have 'active' status
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Set joined_at for existing users to their created_at
UPDATE users SET joined_at = created_at WHERE joined_at IS NULL;

-- Set last_active_at for existing users to their last_login_at or created_at
UPDATE users SET last_active_at = COALESCE(last_login_at, created_at) WHERE last_active_at IS NULL;
