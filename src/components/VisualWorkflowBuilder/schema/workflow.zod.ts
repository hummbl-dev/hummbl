/**
 * Workflow Validation Schemas using Zod
 * 
 * Provides runtime type validation and parsing for workflow, agent, and task data structures.
 * Ensures data integrity across the Visual Workflow Builder using DE3 (Decomposition).
 * 
 * @module workflow.zod
 * @version 1.0.0
 * @see https://hummbl.io/docs/visual-workflow-builder
 */

import { z } from 'zod';

// Using DE3 (Decomposition - Break down): Separate validation schemas by domain

/**
 * Agent Role Schema
 */
export const AgentRoleSchema = z.enum([
  'researcher',
  'analyst',
  'executor',
  'reviewer',
  'custom',
]);

/**
 * Task Status Schema
 */
export const TaskStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
]);

/**
 * Workflow Status Schema
 */
export const WorkflowStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'failed',
]);

/**
 * Agent Schema
 * Using P1 (Perspective - Frame): Define agent structure
 */
export const AgentSchema = z.object({
  id: z.string().uuid('Agent ID must be a valid UUID'),
  name: z.string().min(1, 'Agent name is required').max(100),
  role: AgentRoleSchema,
  description: z.string().max(500),
  capabilities: z.array(z.string()).min(1, 'Agent must have at least one capability'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Task Schema
 * Using CO5 (Composition - Build up): Compose task dependencies
 */
export const TaskSchema = z.object({
  id: z.string().uuid('Task ID must be a valid UUID'),
  name: z.string().min(1, 'Task name is required').max(100),
  description: z.string().max(500),
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  status: TaskStatusSchema,
  dependencies: z.array(z.string().uuid()).default([]),
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  retryCount: z.number().nonnegative().default(0),
  maxRetries: z.number().nonnegative().default(3),
}).refine(
  (task) => {
    // Circular dependency check using RE4 (Recursion - Self-reference)
    if (task.dependencies.includes(task.id)) {
      return false;
    }
    return true;
  },
  {
    message: 'Task cannot depend on itself',
    path: ['dependencies'],
  }
);

/**
 * Workflow Schema
 * Using SY8 (Systems - Meta-systems): Workflow as emergent system
 */
export const WorkflowSchema = z.object({
  id: z.string().uuid('Workflow ID must be a valid UUID'),
  name: z.string().min(1, 'Workflow name is required').max(100),
  description: z.string().max(1000),
  status: WorkflowStatusSchema,
  tasks: z.array(TaskSchema).min(1, 'Workflow must have at least one task'),
  agents: z.array(AgentSchema).min(1, 'Workflow must have at least one agent'),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (workflow) => {
    // Validate all tasks reference valid agents
    const agentIds = new Set(workflow.agents.map((a) => a.id));
    return workflow.tasks.every((task) => agentIds.has(task.agentId));
  },
  {
    message: 'All tasks must reference valid agents in the workflow',
    path: ['tasks'],
  }
).refine(
  (workflow) => {
    // Validate task dependencies reference valid tasks
    const taskIds = new Set(workflow.tasks.map((t) => t.id));
    return workflow.tasks.every((task) =>
      task.dependencies.every((depId) => taskIds.has(depId))
    );
  },
  {
    message: 'All task dependencies must reference valid tasks in the workflow',
    path: ['tasks'],
  }
);

/**
 * Workflow Template Schema (for creating workflows from templates)
 */
export const WorkflowTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  category: z.string().min(1),
  tasks: z.array(
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500),
      agentId: z.string().uuid(),
      dependencies: z.array(z.string().uuid()).default([]),
      input: z.record(z.string(), z.unknown()).optional(),
      retryCount: z.number().nonnegative().default(0),
      maxRetries: z.number().nonnegative().default(3),
    })
  ),
  agents: z.array(
    z.object({
      name: z.string().min(1).max(100),
      role: AgentRoleSchema,
      description: z.string().max(500),
      capabilities: z.array(z.string()).min(1),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
    })
  ),
  tags: z.array(z.string()).default([]),
});

/**
 * Execution Log Schema
 */
export const ExecutionLogSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  taskId: z.string().uuid(),
  timestamp: z.date(),
  level: z.enum(['info', 'warning', 'error']),
  message: z.string().min(1).max(500),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Workflow Metrics Schema
 */
export const WorkflowMetricsSchema = z.object({
  totalWorkflows: z.number().nonnegative(),
  activeWorkflows: z.number().nonnegative(),
  completedWorkflows: z.number().nonnegative(),
  failedWorkflows: z.number().nonnegative(),
  averageExecutionTime: z.number().nonnegative(),
  successRate: z.number().min(0).max(100),
});

/**
 * Visual Node Data Schemas (for React Flow)
 */
export const AgentNodeDataSchema = z.object({
  agent: AgentSchema,
});

export const TaskNodeDataSchema = z.object({
  task: TaskSchema,
  agents: z.array(AgentSchema),
});

/**
 * Type exports inferred from schemas
 * Using P1 (Perspective - Frame): Single source of truth for types
 */
export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;
export type ExecutionLog = z.infer<typeof ExecutionLogSchema>;
export type WorkflowMetrics = z.infer<typeof WorkflowMetricsSchema>;
export type AgentNodeData = z.infer<typeof AgentNodeDataSchema>;
export type TaskNodeData = z.infer<typeof TaskNodeDataSchema>;

/**
 * Validation utility functions
 * Using Result pattern for explicit error handling
 */
export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export const validateAgent = (data: unknown): ValidationResult<Agent> => {
  const result = AgentSchema.safeParse(data);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false, error: result.error.message };
};

export const validateTask = (data: unknown): ValidationResult<Task> => {
  const result = TaskSchema.safeParse(data);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false, error: result.error.message };
};

export const validateWorkflow = (data: unknown): ValidationResult<Workflow> => {
  const result = WorkflowSchema.safeParse(data);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false, error: result.error.message };
};

export const validateWorkflowTemplate = (
  data: unknown
): ValidationResult<WorkflowTemplate> => {
  const result = WorkflowTemplateSchema.safeParse(data);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  return { ok: false, error: result.error.message };
};
