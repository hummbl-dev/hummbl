/**
 * Workflow Execution Service
 * Orchestrates workflow execution with AI providers
 */

import type { Env } from '../types';
import { logger } from '../lib/logger';
import { fetchWithTimeout, retryWithBackoff } from '../lib/http';

export interface WorkflowTask {
  id: string;
  name: string;
  description: string;
  agentId: string;
  dependencies?: string[];
  prompt?: string;
}

export interface WorkflowAgent {
  id: string;
  name: string;
  model: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  tasks: WorkflowTask[];
  agents: WorkflowAgent[];
}

export interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  taskResults: TaskResult[];
  error?: string;
}

export interface TaskResult {
  taskId: string;
  taskName: string;
  status: 'completed' | 'failed';
  output: any;
  error?: string;
  tokensUsed: number;
  cost: number;
  duration: number;
}

/**
 * Execute a workflow with AI providers
 */
export async function executeWorkflow(
  env: Env,
  userId: string,
  workflowData: WorkflowData,
  input?: Record<string, unknown>,
  apiKeys?: { anthropic?: string; openai?: string }
): Promise<ExecutionResult> {
  const executionId = crypto.randomUUID();
  const startedAt = Date.now();

  logger.info('Starting workflow execution', { executionId, workflowId: workflowData.id, userId });

  // Save execution record
  try {
    await env.DB.prepare(`
      INSERT INTO executions (id, workflow_id, workflow_name, user_id, status, started_at, input)
      VALUES (?, ?, ?, ?, 'running', ?, ?)
    `).bind(
      executionId,
      workflowData.id,
      workflowData.name,
      userId,
      startedAt,
      JSON.stringify(input || {})
    ).run();
  } catch (error) {
    logger.error('Failed to insert execution record', error as Error);
    throw error;
  }

  const taskResults: TaskResult[] = [];
  const taskOutputs: Record<string, any> = {}; // Store outputs for dependencies

  try {
    // Execute tasks in dependency order
    const executedTasks = new Set<string>();
    
    while (executedTasks.size < workflowData.tasks.length) {
      const readyTasks = workflowData.tasks.filter(task => {
        if (executedTasks.has(task.id)) return false;
        if (!task.dependencies || task.dependencies.length === 0) return true;
        return task.dependencies.every(dep => executedTasks.has(dep));
      });

      if (readyTasks.length === 0) {
        throw new Error('Circular dependency or missing tasks detected');
      }

      // Execute ready tasks in parallel
      const results = await Promise.all(
        readyTasks.map(task => executeTask(env, executionId, task, workflowData.agents, taskOutputs, input, apiKeys))
      );

      results.forEach((result, index) => {
        const task = readyTasks[index];
        taskResults.push(result);
        executedTasks.add(task.id);
        
        if (result.status === 'completed') {
          taskOutputs[task.id] = result.output;
        }
      });
    }

    // Update execution as completed
    const completedAt = Date.now();
    await env.DB.prepare(`
      UPDATE executions 
      SET status = 'completed', completed_at = ?, progress = 100
      WHERE id = ?
    `).bind(completedAt, executionId).run();

    logger.info('Workflow execution completed', { executionId });

    return {
      executionId,
      status: 'completed',
      taskResults,
    };

  } catch (error) {
    logger.error('Workflow execution failed', error as Error, { executionId });

    // Update execution as failed
    const completedAt = Date.now();
    await env.DB.prepare(`
      UPDATE executions 
      SET status = 'failed', completed_at = ?, error = ?
      WHERE id = ?
    `).bind(
      completedAt,
      error instanceof Error ? error.message : 'Unknown error',
      executionId
    ).run();

    return {
      executionId,
      status: 'failed',
      taskResults,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a single task
 */
async function executeTask(
  env: Env,
  executionId: string,
  task: WorkflowTask,
  agents: WorkflowAgent[],
  taskOutputs: Record<string, any>,
  input?: Record<string, unknown>,
  apiKeys?: { anthropic?: string; openai?: string }
): Promise<TaskResult> {
  const taskResultId = crypto.randomUUID();
  const startedAt = Date.now();

  const agent = agents.find(a => a.id === task.agentId);
  if (!agent) {
    throw new Error(`Agent ${task.agentId} not found for task ${task.id}`);
  }

  logger.info('Executing task', { executionId, taskId: task.id, agent: agent.name });

  // Save task record as running
  await env.DB.prepare(`
    INSERT INTO execution_tasks (id, execution_id, task_id, task_name, agent_name, status, started_at)
    VALUES (?, ?, ?, ?, ?, 'running', ?)
  `).bind(
    taskResultId,
    executionId,
    task.id,
    task.name,
    agent.name,
    startedAt
  ).run();

  try {
    // Build prompt with context from dependencies
    let prompt = task.prompt || task.description;
    
    if (task.dependencies && task.dependencies.length > 0) {
      prompt += '\n\nContext from previous tasks:\n';
      task.dependencies.forEach(depId => {
        if (taskOutputs[depId]) {
          prompt += `\n${depId}: ${JSON.stringify(taskOutputs[depId])}\n`;
        }
      });
    }

    if (input) {
      prompt += '\n\nInput data:\n' + JSON.stringify(input, null, 2);
    }

    // Call AI provider
    const result = await callAIProvider(env, agent, prompt, apiKeys);

    const completedAt = Date.now();
    const duration = completedAt - startedAt;

    // Update task as completed
    await env.DB.prepare(`
      UPDATE execution_tasks 
      SET status = 'completed', output = ?, tokens_used = ?, cost = ?, completed_at = ?, duration = ?
      WHERE id = ?
    `).bind(
      JSON.stringify(result.output),
      result.tokensUsed,
      result.cost,
      completedAt,
      duration,
      taskResultId
    ).run();

    logger.info('Task completed', { executionId, taskId: task.id, tokensUsed: result.tokensUsed });

    return {
      taskId: task.id,
      taskName: task.name,
      status: 'completed',
      output: result.output,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      duration,
    };

  } catch (error) {
    logger.error('Task failed', error as Error, { executionId, taskId: task.id });

    const completedAt = Date.now();
    const duration = completedAt - startedAt;

    // Update task as failed
    await env.DB.prepare(`
      UPDATE execution_tasks 
      SET status = 'failed', error = ?, completed_at = ?, duration = ?
      WHERE id = ?
    `).bind(
      error instanceof Error ? error.message : 'Unknown error',
      completedAt,
      duration,
      taskResultId
    ).run();

    return {
      taskId: task.id,
      taskName: task.name,
      status: 'failed',
      output: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokensUsed: 0,
      cost: 0,
      duration,
    };
  }
}

/**
 * Call AI provider (Anthropic or OpenAI)
 */
async function callAIProvider(
  env: Env,
  agent: WorkflowAgent,
  prompt: string,
  apiKeys?: { anthropic?: string; openai?: string }
): Promise<{ output: any; tokensUsed: number; cost: number }> {
  
  // Determine provider from model name
  const isAnthropic = agent.model.includes('claude');
  const isOpenAI = agent.model.includes('gpt');
  const isXAI = agent.model.includes('grok');

  if (isAnthropic) {
    return await callAnthropic(env, agent, prompt, apiKeys?.anthropic);
  } else if (isOpenAI) {
    return await callOpenAI(env, agent, prompt, apiKeys?.openai);
  } else if (isXAI) {
    return await callXAI(env, agent, prompt, apiKeys?.xai);
  } else {
    throw new Error(`Unknown model: ${agent.model}`);
  }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  env: Env,
  agent: WorkflowAgent,
  prompt: string,
  apiKey?: string
): Promise<{ output: any; tokensUsed: number; cost: number }> {
  
  const key = apiKey || env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY not configured. Please add your API key in Settings.');
  }

  const messages = [
    { role: 'user', content: prompt }
  ];

  if (agent.systemPrompt) {
    messages.unshift({ role: 'system', content: agent.systemPrompt });
  }

  const response = await retryWithBackoff(() =>
    fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: agent.model,
        max_tokens: 4096,
        temperature: agent.temperature ?? 0.7,
        messages: messages.filter(m => m.role !== 'system'), // Anthropic uses system param separately
        system: agent.systemPrompt,
      }),
    }, 60000)
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json() as any;
  const output = data.content[0].text;
  const tokensUsed = data.usage.input_tokens + data.usage.output_tokens;
  
  // Rough cost calculation (adjust per model pricing)
  const cost = (tokensUsed / 1000000) * 3.0; // $3 per million tokens (approximate)

  return { output, tokensUsed, cost };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  env: Env,
  agent: WorkflowAgent,
  prompt: string,
  apiKey?: string
): Promise<{ output: any; tokensUsed: number; cost: number }> {
  
  const key = apiKey || env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY not configured. Please add your API key in Settings.');
  }

  const messages: any[] = [
    { role: 'user', content: prompt }
  ];

  if (agent.systemPrompt) {
    messages.unshift({ role: 'system', content: agent.systemPrompt });
  }

  const response = await retryWithBackoff(() =>
    fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: agent.model,
        messages,
        temperature: agent.temperature ?? 0.7,
        max_tokens: 4096,
      }),
    }, 60000)
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json() as any;
  const output = data.choices[0].message.content;
  const tokensUsed = data.usage.total_tokens;
  
  // Rough cost calculation (adjust per model pricing)
  const cost = (tokensUsed / 1000000) * 2.0; // $2 per million tokens (approximate)

  return { output, tokensUsed, cost };
}

/**
 * Call xAI Grok API
 */
async function callXAI(
  env: Env,
  agent: WorkflowAgent,
  prompt: string,
  apiKey?: string
): Promise<{ output: any; tokensUsed: number; cost: number }> {
  
  const key = apiKey || env.XAI_API_KEY;
  if (!key) {
    throw new Error('XAI_API_KEY not configured. Please add your API key in Settings.');
  }

  const messages = [
    { role: 'user', content: prompt }
  ];

  if (agent.systemPrompt) {
    messages.unshift({ role: 'system', content: agent.systemPrompt });
  }

  const response = await retryWithBackoff(() =>
    fetchWithTimeout('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: agent.model,
        messages,
        temperature: agent.temperature ?? 0.7,
        max_tokens: 4096,
      }),
    }, 60000)
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`xAI API error: ${error}`);
  }

  const data = await response.json() as any;
  const output = data.choices[0].message.content;
  const tokensUsed = data.usage.total_tokens;
  
  // Rough cost calculation (xAI pricing not public yet, using placeholder)
  const cost = 0; // Update when pricing is available

  return { output, tokensUsed, cost };
}
