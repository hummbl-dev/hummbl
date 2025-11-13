/**
 * HUMMBL Workers Types
 * TypeScript definitions for Cloudflare Workers backend
 * Aligned with Base120 T5 (Execution) transformation
 */

// Environment bindings (from wrangler.toml)
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  ENV: string;
  APP_URL?: string; // Frontend URL for email links
  FROM_EMAIL?: string; // Email sender address
  RESEND_API_KEY?: string; // Resend API key for email sending
  XAI_API_KEY?: string; // xAI/Grok API key (optional)
}

// Result type pattern (explicit success/failure)
export type Result<T, E = string> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Workflow execution status
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// Database models
export interface WorkflowDB {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface ExecutionDB {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at: number;
  completed_at: number | null;
  error: string | null;
}

export interface TaskResultDB {
  id: string;
  execution_id: string;
  task_id: string;
  task_name: string;
  agent_id: string;
  status: TaskStatus;
  output: string | null; // JSON stringified
  error: string | null;
  started_at: number | null;
  completed_at: number | null;
  retry_count: number;
}

// API request/response types
export interface ExecuteWorkflowRequest {
  workflowData: {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    agents: Agent[];
  };
  apiKeys: {
    anthropic?: string;
    openai?: string;
  };
  input?: Record<string, unknown>;
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  status: ExecutionStatus;
  message: string;
}

export interface GetExecutionResponse {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  progress: number;
  taskResults: TaskResultResponse[];
  startedAt: number;
  completedAt: number | null;
  error: string | null;
}

export interface TaskResultResponse {
  id: string;
  taskId: string;
  taskName: string;
  status: TaskStatus;
  output: unknown;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
  duration: number | null;
}

// Workflow components (from frontend)
export interface Task {
  id: string;
  name: string;
  description: string;
  agentId: string;
  dependencies: string[];
  status: TaskStatus;
  input?: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  model: string;
  temperature: number;
}

// AI provider types
export interface AIProvider {
  name: 'anthropic' | 'openai';
  apiKey: string;
  model: string;
}

export interface AIResponse {
  content: string;
  provider: 'anthropic' | 'openai';
  model: string;
  tokensUsed?: number;
  error?: string;
}

// Task execution context
export interface TaskExecutionContext {
  taskId: string;
  workflowId: string;
  executionId: string;
  dependencies: Map<string, unknown>;
  input?: Record<string, unknown>;
}
