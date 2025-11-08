/**
 * Task Executor
 * 
 * @module services/taskExecutor
 * @version 1.0.0
 * @description Executes individual workflow tasks with AI agents
 * 
 * HUMMBL Systems - Using DE3 (Decomposition)
 */

import { callAI, createProvider, type AIResponse } from './ai';
import type { Task, Agent } from '../types/workflow';

export interface TaskExecutionContext {
  taskResults: Map<string, TaskResult>;
  workflowInput?: Record<string, unknown>;
}

export interface TaskResult {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  aiResponse?: AIResponse;
}

/**
 * Execute a single task with assigned agent
 */
export const executeTask = async (
  task: Task,
  agent: Agent,
  context: TaskExecutionContext
): Promise<TaskResult> => {
  const result: TaskResult = {
    taskId: task.id,
    status: 'running',
    startedAt: new Date(),
    retryCount: task.retryCount,
  };

  try {
    // Check if dependencies are met
    const dependenciesMet = await checkDependencies(task, context);
    if (!dependenciesMet) {
      result.status = 'failed';
      result.error = 'Dependencies not satisfied';
      result.completedAt = new Date();
      return result;
    }

    // Gather dependency outputs as context
    const dependencyContext = gatherDependencyContext(task, context);

    // Build prompt for AI
    const prompt = buildTaskPrompt(task, agent, dependencyContext);

    // Create AI provider from agent's model
    if (!agent.model) {
      result.status = 'failed';
      result.error = 'Agent model not configured';
      result.completedAt = new Date();
      return result;
    }
    
    const provider = createProvider(agent.model);

    // Call AI
    const aiResponse = await callAI(provider, {
      prompt,
      context: {
        ...context.workflowInput,
        ...task.input,
        dependencies: dependencyContext,
      },
      temperature: agent.temperature,
    });

    // Check for AI errors
    if (aiResponse.error) {
      result.status = 'failed';
      result.error = aiResponse.error;
      result.aiResponse = aiResponse;
      result.completedAt = new Date();
      return result;
    }

    // Parse AI response as task output
    result.output = parseTaskOutput(aiResponse.content);
    result.status = 'completed';
    result.aiResponse = aiResponse;
    result.completedAt = new Date();

    return result;
  } catch (error) {
    result.status = 'failed';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.completedAt = new Date();
    return result;
  }
};

/**
 * Check if task dependencies are satisfied
 */
const checkDependencies = async (
  task: Task,
  context: TaskExecutionContext
): Promise<boolean> => {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }

  // Check if all dependencies have completed successfully
  for (const depId of task.dependencies) {
    const depResult = context.taskResults.get(depId);
    if (!depResult || depResult.status !== 'completed') {
      return false;
    }
  }

  return true;
};

/**
 * Gather outputs from dependency tasks
 */
const gatherDependencyContext = (
  task: Task,
  context: TaskExecutionContext
): Record<string, unknown> => {
  const dependencyContext: Record<string, unknown> = {};

  if (!task.dependencies) return dependencyContext;

  for (const depId of task.dependencies) {
    const depResult = context.taskResults.get(depId);
    if (depResult && depResult.output) {
      dependencyContext[depId] = depResult.output;
    }
  }

  return dependencyContext;
};

/**
 * Build AI prompt for task
 */
const buildTaskPrompt = (
  task: Task,
  agent: Agent,
  dependencyContext: Record<string, unknown>
): string => {
  let prompt = `You are a ${agent.role} agent named ${agent.name}.\n\n`;
  prompt += `Your capabilities: ${agent.capabilities.join(', ')}\n\n`;
  prompt += `Task: ${task.name}\n`;
  prompt += `Description: ${task.description}\n\n`;

  if (Object.keys(dependencyContext).length > 0) {
    prompt += `Previous task results:\n`;
    prompt += JSON.stringify(dependencyContext, null, 2);
    prompt += '\n\n';
  }

  if (task.input && Object.keys(task.input).length > 0) {
    prompt += `Task input:\n`;
    prompt += JSON.stringify(task.input, null, 2);
    prompt += '\n\n';
  }

  prompt += `Please complete this task and provide the output in a clear, structured format.`;

  return prompt;
};

/**
 * Parse AI response into structured output
 */
const parseTaskOutput = (content: string): unknown => {
  // Try to parse as JSON first
  try {
    return JSON.parse(content);
  } catch {
    // If not JSON, return as text
    return { result: content };
  }
};

/**
 * Retry failed task
 */
export const retryTask = async (
  task: Task,
  agent: Agent,
  context: TaskExecutionContext,
  previousResult: TaskResult
): Promise<TaskResult> => {
  // Check if max retries exceeded
  if (task.retryCount >= task.maxRetries) {
    return {
      ...previousResult,
      status: 'failed',
      error: `Max retries (${task.maxRetries}) exceeded`,
    };
  }

  // Increment retry count
  task.retryCount++;

  // Execute task again
  return await executeTask(task, agent, context);
};
