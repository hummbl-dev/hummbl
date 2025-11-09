/**
 * HUMMBL Workflow Execution Routes
 * POST /api/workflows/:id/execute - Execute a workflow
 * Using T3 (Decision): Dependency resolution before execution
 */

import { Hono } from 'hono';
import type { Env, ExecuteWorkflowRequest, Task, Agent } from '../types';
import { createExecution, createTaskResult, updateTaskResult, updateExecutionStatus } from '../lib/db';
import { callAI, createAIProvider } from '../services/ai';
import { rateLimit, RATE_LIMITS } from '../lib/rateLimit';

const workflows = new Hono<{ Bindings: Env }>();

// Apply rate limiting to execution endpoint
workflows.use('/:id/execute', rateLimit(RATE_LIMITS.execution));

/**
 * Execute workflow endpoint
 * POST /api/workflows/:id/execute
 */
workflows.post('/:id/execute', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request body
    const { validate, ExecuteWorkflowRequestSchema } = await import('../lib/validation');
    const validation = validate(ExecuteWorkflowRequestSchema, body);
    
    if (!validation.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        400
      );
    }
    
    const { workflowData, apiKeys, input } = validation.data;

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
    const { logger } = await import('../lib/logger');
    logger.error('Execute workflow error', error, { workflowId: c.req.param('id') });
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
  // Wrap everything in try-catch to capture execution errors
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
    const { logger } = await import('../lib/logger');
    logger.error('Workflow execution error', error, { executionId, workflowId: workflowData.id });
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

/**
 * Share workflow with team member
 * POST /api/workflows/:id/share
 */
workflows.post('/:id/share', async (c) => {
  try {
    const workflowId = c.req.param('id');
    const shareData = await c.req.json<{
      userId: string;
      permissionLevel: 'view' | 'edit' | 'admin';
    }>();

    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check if current user owns the workflow or has admin permissions
    const workflowOwner = await c.env.DB.prepare(`
      SELECT created_by FROM workflows WHERE id = ?
    `).bind(workflowId).first();

    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!workflowOwner || (workflowOwner.created_by !== currentUserId && currentUser?.role !== 'owner' && currentUser?.role !== 'admin')) {
      return c.json({ error: 'Insufficient permissions to share this workflow' }, 403);
    }

    // Check if user exists
    const targetUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE id = ?
    `).bind(shareData.userId).first();

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if already shared
    const existingShare = await c.env.DB.prepare(`
      SELECT id FROM workflow_sharing
      WHERE workflow_id = ? AND shared_with_user_id = ?
    `).bind(workflowId, shareData.userId).first();

    const now = Math.floor(Date.now() / 1000);

    if (existingShare) {
      // Update existing share
      await c.env.DB.prepare(`
        UPDATE workflow_sharing
        SET permission_level = ?, created_at = ?
        WHERE id = ?
      `).bind(shareData.permissionLevel, now, existingShare.id).run();
    } else {
      // Create new share
      const shareId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO workflow_sharing (
          id, workflow_id, shared_with_user_id, shared_by_user_id,
          permission_level, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        shareId,
        workflowId,
        shareData.userId,
        currentUserId,
        shareData.permissionLevel,
        now
      ).run();
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Share workflow error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to share workflow' },
      500
    );
  }
});

/**
 * Get workflows shared with current user
 * GET /api/workflows/shared
 */
workflows.get('/shared', async (c) => {
  try {
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    const sharedWorkflows = await c.env.DB.prepare(`
      SELECT
        w.id, w.name, w.description, w.status, w.created_at, w.updated_at,
        ws.permission_level, ws.shared_by_user_id, u.name as shared_by_name
      FROM workflows w
      JOIN workflow_sharing ws ON w.id = ws.workflow_id
      LEFT JOIN users u ON ws.shared_by_user_id = u.id
      WHERE ws.shared_with_user_id = ?
      ORDER BY ws.created_at DESC
    `).bind(currentUserId).all();

    return c.json({
      workflows: sharedWorkflows.results.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        status: w.status,
        permissionLevel: w.permission_level,
        sharedBy: w.shared_by_user_id,
        sharedByName: w.shared_by_name,
        createdAt: (w.created_at as number) * 1000,
        updatedAt: (w.updated_at as number) * 1000,
      })),
    });
  } catch (error) {
    console.error('Get shared workflows error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch shared workflows' },
      500
    );
  }
});

/**
 * Remove workflow sharing
 * DELETE /api/workflows/:id/share/:userId
 */
workflows.delete('/:id/share/:userId', async (c) => {
  try {
    const workflowId = c.req.param('id');
    const targetUserId = c.req.param('userId');
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const workflowOwner = await c.env.DB.prepare(`
      SELECT created_by FROM workflows WHERE id = ?
    `).bind(workflowId).first();

    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!workflowOwner || (workflowOwner.created_by !== currentUserId && currentUser?.role !== 'owner' && currentUser?.role !== 'admin')) {
      return c.json({ error: 'Insufficient permissions to manage sharing' }, 403);
    }

    const result = await c.env.DB.prepare(`
      DELETE FROM workflow_sharing
      WHERE workflow_id = ? AND shared_with_user_id = ?
    `).bind(workflowId, targetUserId).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Sharing not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Remove workflow sharing error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to remove workflow sharing' },
      500
    );
  }
});

/**
 * Get workflow sharing permissions
 * GET /api/workflows/:id/sharing
 */
workflows.get('/:id/sharing', async (c) => {
  try {
    const workflowId = c.req.param('id');
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const workflowOwner = await c.env.DB.prepare(`
      SELECT created_by FROM workflows WHERE id = ?
    `).bind(workflowId).first();

    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!workflowOwner || (workflowOwner.created_by !== currentUserId && currentUser?.role !== 'owner' && currentUser?.role !== 'admin')) {
      return c.json({ error: 'Insufficient permissions to view sharing' }, 403);
    }

    const sharing = await c.env.DB.prepare(`
      SELECT
        ws.id, ws.shared_with_user_id, ws.permission_level, ws.created_at,
        u.name, u.email
      FROM workflow_sharing ws
      JOIN users u ON ws.shared_with_user_id = u.id
      WHERE ws.workflow_id = ?
      ORDER BY ws.created_at DESC
    `).bind(workflowId).all();

    return c.json({
      sharing: sharing.results.map(s => ({
        id: s.id,
        userId: s.shared_with_user_id,
        userName: s.name,
        userEmail: s.email,
        permissionLevel: s.permission_level,
        createdAt: (s.created_at as number) * 1000,
      })),
    });
  } catch (error) {
    console.error('Get workflow sharing error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch workflow sharing' },
      500
    );
  }
});

export default workflows;
