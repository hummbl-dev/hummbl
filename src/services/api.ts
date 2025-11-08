/**
 * HUMMBL Frontend API Service
 * Proxies workflow execution through Cloudflare Workers backend
 * Solves CORS issue by calling server-side API
 */

import type { Workflow } from '../types/workflow';

// API URL - switches between local dev and production
const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787'
  : 'https://hummbl-backend.hummbl.workers.dev';

/**
 * Execute workflow via backend
 * @param workflow - Workflow to execute
 * @param apiKeys - User's API keys (optional, falls back to server secrets)
 * @param input - Optional workflow input data
 */
export async function executeWorkflow(
  workflow: Workflow,
  apiKeys: {
    anthropic?: string;
    openai?: string;
  },
  input?: Record<string, unknown>
): Promise<{ executionId: string; status: string; message: string }> {
  const response = await fetch(`${API_URL}/api/workflows/${workflow.id}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflowData: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        tasks: workflow.tasks,
        agents: workflow.agents,
      },
      apiKeys,
      input,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute workflow');
  }

  return response.json();
}

/**
 * Get execution status and results
 * @param executionId - Execution ID to check
 */
export async function getExecutionStatus(executionId: string): Promise<{
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  taskResults: Array<{
    id: string;
    taskId: string;
    taskName: string;
    status: string;
    output: unknown;
    error: string | null;
    startedAt: number | null;
    completedAt: number | null;
    duration: number | null;
  }>;
  startedAt: number;
  completedAt: number | null;
  error: string | null;
}> {
  const response = await fetch(`${API_URL}/api/executions/${executionId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get execution status');
  }

  return response.json();
}

/**
 * Poll for execution updates
 * @param executionId - Execution ID to poll
 * @param onUpdate - Callback for status updates
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 */
export function pollExecutionStatus(
  executionId: string,
  onUpdate: (status: Awaited<ReturnType<typeof getExecutionStatus>>) => void,
  intervalMs: number = 2000
): () => void {
  let isPolling = true;

  const poll = async () => {
    while (isPolling) {
      try {
        const status = await getExecutionStatus(executionId);
        onUpdate(status);

        // Stop polling if completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          isPolling = false;
          break;
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling even on error
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  };

  // Start polling
  poll();

  // Return stop function
  return () => {
    isPolling = false;
  };
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: number }> {
  const response = await fetch(`${API_URL}/`);
  return response.json();
}
