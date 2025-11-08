export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type AgentRole = 'researcher' | 'analyst' | 'executor' | 'reviewer' | 'custom';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  capabilities: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  agentId: string;
  status: TaskStatus;
  dependencies: string[]; // IDs of tasks that must complete before this one
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  tasks: Task[];
  agents: Agent[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Omit<Task, 'id' | 'status' | 'startedAt' | 'completedAt' | 'output' | 'error'>[];
  agents: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>[];
  tags: string[];
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  taskId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  successRate: number;
}
