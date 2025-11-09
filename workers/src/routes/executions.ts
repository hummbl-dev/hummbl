/**
 * HUMMBL Execution Status Routes
 * GET /api/executions/:id - Get execution status and results
 * Using T6 (Persistence): Retrieve execution state from D1
 */

import { Hono } from 'hono';
import type { Env, GetExecutionResponse, TaskResultResponse, TaskResultDB } from '../types';
import { getExecution, getTaskResults } from '../lib/db';

const executions = new Hono<{ Bindings: Env }>();

/**
 * Get execution status
 * GET /api/executions/:id
 */
executions.get('/:id', async (c) => {
  try {
    const executionId = c.req.param('id');

    // Get execution from D1
    const executionResult = await getExecution(c.env.DB, executionId);

    if (!executionResult.ok) {
      return c.json({ error: executionResult.error }, 500);
    }

    if (!executionResult.value) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    const execution = executionResult.value;

    // Get task results
    const taskResultsResult = await getTaskResults(c.env.DB, executionId);

    if (!taskResultsResult.ok) {
      return c.json({ error: taskResultsResult.error }, 500);
    }

    const taskResults = taskResultsResult.value;

    // Calculate progress
    const completedTasks = taskResults.filter(
      (t) => t.status === 'completed' || t.status === 'failed'
    ).length;
    const progress = taskResults.length > 0 ? (completedTasks / taskResults.length) * 100 : 0;

    // Format task results
    const formattedTaskResults: TaskResultResponse[] = taskResults.map((tr) =>
      formatTaskResult(tr)
    );

    const response: GetExecutionResponse = {
      id: execution.id,
      workflowId: execution.workflow_id,
      status: execution.status,
      progress,
      taskResults: formattedTaskResults,
      startedAt: execution.started_at,
      completedAt: execution.completed_at,
      error: execution.error,
    };

    return c.json(response);
  } catch (error) {
    console.error('Get execution error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
executions.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'hummbl-backend',
  });
});

/**
 * Format task result for API response
 */
function formatTaskResult(tr: TaskResultDB): TaskResultResponse {
  // Parse output if JSON string
  let output: unknown = tr.output;
  if (typeof tr.output === 'string') {
    try {
      output = JSON.parse(tr.output);
    } catch {
      // Keep as string if not valid JSON
      output = tr.output;
    }
  }

  // Calculate duration
  const duration =
    tr.started_at && tr.completed_at ? tr.completed_at - tr.started_at : null;

  return {
    id: tr.id,
    taskId: tr.task_id,
    taskName: tr.task_name,
    status: tr.status,
    output,
    error: tr.error,
    startedAt: tr.started_at,
    completedAt: tr.completed_at,
    duration,
  };
}

export default executions;
