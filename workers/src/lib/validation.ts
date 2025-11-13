/**
 * Request Validation Schemas
 * 
 * Zod schemas for validating API request bodies
 * 
 * @module workers/lib/validation
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Task schema
 */
export const TaskSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  agentId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
  dependencies: z.array(z.string()).default([]),
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  result: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  retryCount: z.number().int().min(0).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  estimatedTokens: z.number().int().positive().optional(),
});

/**
 * Agent schema
 */
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  role: z.enum(['researcher', 'analyst', 'executor', 'reviewer', 'custom']).optional(),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

/**
 * Workflow data schema
 */
export const WorkflowDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  tasks: z.array(TaskSchema).min(1).max(100),
  agents: z.array(AgentSchema).min(1).max(50),
});

/**
 * Execute workflow request schema
 */
export const ExecuteWorkflowRequestSchema = z.object({
  workflowData: WorkflowDataSchema,
  apiKeys: z.object({
    anthropic: z.string().optional(),
    openai: z.string().optional(),
    xai: z.string().optional(),
  }).optional(),
  input: z.record(z.string(), z.unknown()).optional(),
});

/**
 * API key create schema
 */
export const CreateAPIKeySchema = z.object({
  provider: z.enum(['anthropic', 'openai']),
  key: z.string().min(10),
  name: z.string().min(1).max(100).optional(),
});

/**
 * User invite schema
 */
export const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  teamId: z.string().optional(),
});

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate request body with Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with parsed data or errors
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: ValidationError[] = result.error.issues.map((err) => ({
    field: err.path.map(String).join('.'),
    message: err.message,
  }));
  
  return { success: false, errors };
}
