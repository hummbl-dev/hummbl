/**
 * Workflow Runner
 * 
 * @module services/workflowRunner
 * @version 1.0.0
 * @description Orchestrates workflow execution with task dependencies
 * 
 * HUMMBL Systems - Using SY1 (Systems Thinking)
 */

import { executeTask, retryTask, type TaskResult, type TaskExecutionContext } from './taskExecutor';
import type { Workflow, Task, Agent } from '../types/workflow';

export interface WorkflowExecution {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  taskResults: Map<string, TaskResult>;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
}

export type WorkflowProgressCallback = (execution: WorkflowExecution) => void;

/**
 * Run a workflow with all its tasks
 */
export const runWorkflow = async (
  workflow: Workflow,
  agents: Agent[],
  input?: Record<string, unknown>,
  onProgress?: WorkflowProgressCallback
): Promise<WorkflowExecution> => {
  const execution: WorkflowExecution = {
    workflowId: workflow.id,
    status: 'running',
    taskResults: new Map(),
    startedAt: new Date(),
    progress: 0,
  };

  // Notify initial status
  onProgress?.(execution);

  try {
    // Execute tasks in dependency order
    const tasksToExecute = [...workflow.tasks];
    const context: TaskExecutionContext = {
      taskResults: execution.taskResults,
      workflowInput: input,
    };

    while (tasksToExecute.length > 0) {
      // Find tasks that are ready to execute (dependencies met)
      const readyTasks = findReadyTasks(tasksToExecute, context);

      if (readyTasks.length === 0) {
        // No tasks ready - check if we're stuck
        const pendingTasks = tasksToExecute.filter(
          t => !execution.taskResults.has(t.id)
        );
        
        if (pendingTasks.length > 0) {
          execution.status = 'failed';
          execution.completedAt = new Date();
          throw new Error('Circular dependency or failed dependencies detected');
        }
        break;
      }

      // Execute ready tasks in parallel
      const taskPromises = readyTasks.map(async (task) => {
        // Find assigned agent
        const agent = agents.find(a => task.agentId === a.id);
        if (!agent) {
          const result: TaskResult = {
            taskId: task.id,
            status: 'failed',
            error: `Agent not found: ${task.agentId}`,
            retryCount: 0,
            completedAt: new Date(),
          };
          execution.taskResults.set(task.id, result);
          return;
        }

        // Execute task
        const result = await executeTask(task, agent, context);

        // Handle retry if failed
        if (result.status === 'failed' && task.retryCount < task.maxRetries) {
          const retryResult = await retryTask(task, agent, context, result);
          execution.taskResults.set(task.id, retryResult);
        } else {
          execution.taskResults.set(task.id, result);
        }

        // Update progress
        execution.progress = (execution.taskResults.size / workflow.tasks.length) * 100;
        onProgress?.(execution);
      });

      await Promise.all(taskPromises);

      // Remove completed tasks from queue
      readyTasks.forEach(task => {
        const index = tasksToExecute.findIndex(t => t.id === task.id);
        if (index !== -1) {
          tasksToExecute.splice(index, 1);
        }
      });
    }

    // Check if all tasks completed successfully
    const failedTasks = Array.from(execution.taskResults.values()).filter(
      r => r.status === 'failed'
    );

    if (failedTasks.length > 0) {
      execution.status = 'failed';
    } else {
      execution.status = 'completed';
      execution.progress = 100;
    }

    execution.completedAt = new Date();
    onProgress?.(execution);

    return execution;
  } catch (error) {
    execution.status = 'failed';
    execution.completedAt = new Date();
    onProgress?.(execution);
    throw error;
  }
};

/**
 * Find tasks that are ready to execute (all dependencies met)
 */
const findReadyTasks = (
  tasks: Task[],
  context: TaskExecutionContext
): Task[] => {
  return tasks.filter(task => {
    // Already executed
    if (context.taskResults.has(task.id)) {
      return false;
    }

    // No dependencies - ready
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    // Check if all dependencies are completed
    return task.dependencies.every(depId => {
      const depResult = context.taskResults.get(depId);
      return depResult && depResult.status === 'completed';
    });
  });
};

/**
 * Pause workflow execution
 */
export const pauseWorkflow = (execution: WorkflowExecution): void => {
  execution.status = 'paused';
};

/**
 * Resume workflow execution
 */
export const resumeWorkflow = async (
  execution: WorkflowExecution,
  workflow: Workflow,
  agents: Agent[],
  onProgress?: WorkflowProgressCallback
): Promise<WorkflowExecution> => {
  if (execution.status !== 'paused') {
    throw new Error('Can only resume paused workflows');
  }

  execution.status = 'running';
  onProgress?.(execution);

  // Continue from where we left off
  const remainingTasks = workflow.tasks.filter(
    task => !execution.taskResults.has(task.id)
  );

  // Create a new workflow with remaining tasks
  const remainingWorkflow: Workflow = {
    ...workflow,
    tasks: remainingTasks,
  };

  // Run remaining tasks
  return await runWorkflow(
    remainingWorkflow,
    agents,
    undefined,
    onProgress
  );
};

/**
 * Get workflow execution summary
 */
export const getExecutionSummary = (execution: WorkflowExecution): {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  duration?: number;
} => {
  const results = Array.from(execution.taskResults.values());
  
  return {
    total: execution.taskResults.size,
    completed: results.filter(r => r.status === 'completed').length,
    failed: results.filter(r => r.status === 'failed').length,
    pending: results.filter(r => r.status === 'pending' || r.status === 'running').length,
    duration: execution.startedAt && execution.completedAt
      ? execution.completedAt.getTime() - execution.startedAt.getTime()
      : undefined,
  };
};
