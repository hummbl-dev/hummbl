/**
 * HUMMBL D1 Database Helpers
 * Type-safe database operations with Result<T,E> pattern
 * Using DE3 (Decomposition): Break complex DB ops into atomic functions
 */

import type { 
  Env, 
  Result, 
  ExecutionDB, 
  TaskResultDB,
  ExecutionStatus,
  TaskStatus 
} from '../types';

/**
 * Create new execution record
 */
export async function createExecution(
  db: D1Database,
  executionId: string,
  workflowId: string
): Promise<Result<ExecutionDB>> {
  try {
    const now = Date.now();
    
    await db
      .prepare(
        'INSERT INTO executions (id, workflow_id, status, started_at) VALUES (?, ?, ?, ?)'
      )
      .bind(executionId, workflowId, 'running', now)
      .run();

    const execution: ExecutionDB = {
      id: executionId,
      workflow_id: workflowId,
      status: 'running',
      started_at: now,
      completed_at: null,
      error: null,
    };

    return { ok: true, value: execution };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to create execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get execution by ID
 */
export async function getExecution(
  db: D1Database,
  executionId: string
): Promise<Result<ExecutionDB | null>> {
  try {
    const result = await db
      .prepare('SELECT * FROM executions WHERE id = ?')
      .bind(executionId)
      .first<ExecutionDB>();

    return { ok: true, value: result };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to get execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update execution status
 */
export async function updateExecutionStatus(
  db: D1Database,
  executionId: string,
  status: ExecutionStatus,
  error?: string
): Promise<Result<void>> {
  try {
    const now = Date.now();
    const completedAt = status === 'completed' || status === 'failed' ? now : null;

    await db
      .prepare(
        'UPDATE executions SET status = ?, completed_at = ?, error = ? WHERE id = ?'
      )
      .bind(status, completedAt, error || null, executionId)
      .run();

    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to update execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create task result record
 */
export async function createTaskResult(
  db: D1Database,
  taskResult: {
    id: string;
    executionId: string;
    taskId: string;
    taskName: string;
    agentId: string;
  }
): Promise<Result<TaskResultDB>> {
  try {
    const now = Date.now();

    await db
      .prepare(
        `INSERT INTO task_results 
         (id, execution_id, task_id, task_name, agent_id, status, started_at, retry_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        taskResult.id,
        taskResult.executionId,
        taskResult.taskId,
        taskResult.taskName,
        taskResult.agentId,
        'running',
        now,
        0
      )
      .run();

    const result: TaskResultDB = {
      id: taskResult.id,
      execution_id: taskResult.executionId,
      task_id: taskResult.taskId,
      task_name: taskResult.taskName,
      agent_id: taskResult.agentId,
      status: 'running',
      output: null,
      error: null,
      started_at: now,
      completed_at: null,
      retry_count: 0,
    };

    return { ok: true, value: result };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to create task result: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update task result
 */
export async function updateTaskResult(
  db: D1Database,
  taskResultId: string,
  update: {
    status: TaskStatus;
    output?: unknown;
    error?: string;
  }
): Promise<Result<void>> {
  try {
    const now = Date.now();
    const completedAt = update.status === 'completed' || update.status === 'failed' ? now : null;
    const outputStr = update.output !== undefined ? JSON.stringify(update.output) : null;

    await db
      .prepare(
        `UPDATE task_results 
         SET status = ?, output = ?, error = ?, completed_at = ? 
         WHERE id = ?`
      )
      .bind(
        update.status,
        outputStr,
        update.error || null,
        completedAt,
        taskResultId
      )
      .run();

    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to update task result: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get all task results for an execution
 */
export async function getTaskResults(
  db: D1Database,
  executionId: string
): Promise<Result<TaskResultDB[]>> {
  try {
    const { results } = await db
      .prepare('SELECT * FROM task_results WHERE execution_id = ? ORDER BY started_at ASC')
      .bind(executionId)
      .all<TaskResultDB>();

    return { ok: true, value: results || [] };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to get task results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Increment retry count for a task
 */
export async function incrementRetryCount(
  db: D1Database,
  taskResultId: string
): Promise<Result<void>> {
  try {
    await db
      .prepare('UPDATE task_results SET retry_count = retry_count + 1 WHERE id = ?')
      .bind(taskResultId)
      .run();

    return { ok: true, value: undefined };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to increment retry count: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
