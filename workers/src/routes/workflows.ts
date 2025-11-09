/**
 * HUMMBL Workflow Execution Routes
 * POST /api/workflows/:id/execute - Execute a workflow
 * Using T3 (Decision): Dependency resolution before execution
 */

import { Hono } from 'hono';
import type { Env, ExecuteWorkflowRequest, Task, Agent } from '../types';
import { createExecution, createTaskResult, updateTaskResult, updateExecutionStatus } from '../lib/db';
import { callAI, createAIProvider } from '../services/ai';

const workflows = new Hono<{ Bindings: Env }>();

/**
 * Execute workflow endpoint
 * POST /api/workflows/:id/execute
 */
workflows.post('/:id/execute', async (c) => {
  try {
    const body = await c.req.json<ExecuteWorkflowRequest>();
    const { workflowData, apiKeys, input } = body;

    // Generate execution ID
    const executionId = crypto.randomUUID();

    // Insert workflow into D1 if it doesn't exist (to satisfy foreign key)
    const workflowInsert = await c.env.DB.prepare(`
      INSERT OR IGNORE INTO workflows (id, name, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      workflowData.id,
      workflowData.name || 'Unnamed Workflow',
      workflowData.description || '',
      'active',
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000)
    ).run();

    if (!workflowInsert.success) {
      return c.json({ error: 'Failed to register workflow' }, 500);
    }

    // Create execution record in D1
    const executionResult = await createExecution(
      c.env.DB,
      executionId,
      workflowData.id
    );

    if (!executionResult.ok) {
      return c.json({ error: executionResult.error }, 500);
    }

    // Start workflow execution asynchronously (don't wait)
    c.executionCtx.waitUntil(
      executeWorkflow(c.env, executionId, workflowData, apiKeys, input)
    );

    return c.json({
      executionId,
      status: 'running',
      message: 'Workflow execution started',
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * Execute workflow logic (runs async in background)
 * Uses topological sort for dependency resolution (T3: Decision)
 */
export async function executeWorkflow(
  env: Env,
  executionId: string,
  workflowData: { id: string; tasks: Task[]; agents: Agent[] },
  apiKeys: { anthropic?: string; openai?: string },
  input?: Record<string, unknown>
): Promise<void> {
  try {
    const { tasks, agents } = workflowData;
    
    // Map to track task outputs
    const taskOutputs = new Map<string, unknown>();
    
    // Execute tasks in dependency order
    const executedTasks = new Set<string>();
    const failedTasks = new Set<string>();

    while (executedTasks.size < tasks.length && failedTasks.size === 0) {
      // Find tasks ready to execute (all dependencies met)
      const readyTasks = tasks.filter(
        (task) =>
          !executedTasks.has(task.id) &&
          !failedTasks.has(task.id) &&
          task.dependencies.every((depId) => executedTasks.has(depId))
      );

      if (readyTasks.length === 0) {
        // No tasks ready - either circular dependency or all failed
        await updateExecutionStatus(
          env.DB,
          executionId,
          'failed',
          'Circular dependency or failed dependencies detected'
        );
        return;
      }

      // Execute ready tasks in parallel
      await Promise.all(
        readyTasks.map(async (task) => {
          const result = await executeTask(
            env,
            executionId,
            task,
            agents,
            apiKeys,
            taskOutputs,
            input
          );

          if (result.ok) {
            executedTasks.add(task.id);
            if (result.output !== undefined) {
              taskOutputs.set(task.id, result.output);
            }
          } else {
            failedTasks.add(task.id);
          }
        })
      );
    }

    // Update final execution status
    if (failedTasks.size > 0) {
      await updateExecutionStatus(
        env.DB,
        executionId,
        'failed',
        'One or more tasks failed'
      );
    } else {
      await updateExecutionStatus(env.DB, executionId, 'completed');
    }
  } catch (error) {
    console.error('Workflow execution error:', error);
    await updateExecutionStatus(
      env.DB,
      executionId,
      'failed',
      error instanceof Error ? error.message : 'Unknown execution error'
    );
  }
}

/**
 * Execute a single task
 */
export async function executeTask(
  env: Env,
  executionId: string,
  task: Task,
  agents: Agent[],
  apiKeys: { anthropic?: string; openai?: string },
  taskOutputs: Map<string, unknown>,
  workflowInput?: Record<string, unknown>
): Promise<{ ok: boolean; output?: unknown; error?: string }> {
  const taskResultId = crypto.randomUUID();

  // Find agent for this task
  const agent = agents.find((a) => a.id === task.agentId);
  if (!agent) {
    const error = `Agent not found: ${task.agentId}`;
    await createTaskResult(env.DB, {
      id: taskResultId,
      executionId,
      taskId: task.id,
      taskName: task.name,
      agentId: task.agentId,
    });
    await updateTaskResult(env.DB, taskResultId, {
      status: 'failed',
      error,
    });
    return { ok: false, error };
  }

  // Create task result record
  await createTaskResult(env.DB, {
    id: taskResultId,
    executionId,
    taskId: task.id,
    taskName: task.name,
    agentId: agent.id,
  });

  // Build context from dependencies
  const context: Record<string, unknown> = {};
  for (const depId of task.dependencies) {
    const depOutput = taskOutputs.get(depId);
    if (depOutput !== undefined) {
      context[depId] = depOutput;
    }
  }

  // Add workflow input to context
  if (workflowInput) {
    context.workflowInput = workflowInput;
  }

  // Create AI provider
  const providerResult = createAIProvider(
    agent.model,
    apiKeys,
    {
      anthropic: env.ANTHROPIC_API_KEY,
      openai: env.OPENAI_API_KEY,
    }
  );

  if (!providerResult.ok) {
    await updateTaskResult(env.DB, taskResultId, {
      status: 'failed',
      error: providerResult.error,
    });
    return { ok: false, error: providerResult.error };
  }

  // Build prompt - use custom prompt if provided, otherwise build generic one
  const customPrompt = (task.input as { prompt?: string })?.prompt;
  const prompt = customPrompt || `
Task: ${task.name}
Description: ${task.description}
Agent Role: ${agent.role}
Agent Description: ${agent.description}
Agent Capabilities: ${agent.capabilities.join(', ')}

Please execute this task and provide the result.
${Object.keys(context).length > 0 ? `\nYou have access to outputs from previous tasks in the context.` : ''}
`.trim();

  // Call AI
  const aiResult = await callAI(
    providerResult.value,
    prompt,
    context,
    agent.temperature,
    2000
  );

  if (!aiResult.ok) {
    await updateTaskResult(env.DB, taskResultId, {
      status: 'failed',
      error: aiResult.error,
    });
    return { ok: false, error: aiResult.error };
  }

  // Update task result with output
  await updateTaskResult(env.DB, taskResultId, {
    status: 'completed',
    output: aiResult.value.content,
  });

  return { ok: true, output: aiResult.value.content };
}

export default workflows;
