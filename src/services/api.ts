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

// ============================================
// TELEMETRY API (Phase 1)
// ============================================

export interface TelemetrySummary {
  totalActions: number;
  uniqueUsers: number;
  activeComponents: number;
  avgResponseTime: number;
  period: string;
}

export interface TopComponent {
  id: string;
  code: string;
  name: string;
  views: number;
  actions: number;
  avgDuration: number;
}

/**
 * Get telemetry summary for analytics dashboard
 * @param range - Time range (7d, 30d, 90d)
 */
export async function getTelemetrySummary(
  range: string = '7d'
): Promise<TelemetrySummary> {
  const response = await fetch(`${API_URL}/api/telemetry/summary?range=${range}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch telemetry summary' }));
    throw new Error(error.error || 'Failed to fetch telemetry summary');
  }
  
  return response.json();
}

/**
 * Get top components by usage
 * @param limit - Number of components to return
 */
export async function getTopComponents(
  limit: number = 10
): Promise<TopComponent[]> {
  const response = await fetch(`${API_URL}/api/telemetry/components/top?limit=${limit}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch top components' }));
    throw new Error(error.error || 'Failed to fetch top components');
  }
  
  const data = await response.json();
  return data.components || [];
}

// ============================================
// TOKEN USAGE API (Phase 2.1)
// ============================================

export interface TokenStats {
  totalTokens: number;
  totalCost: number;
  byModel: Array<{
    model: string;
    tokens: number;
    cost: number;
    percentage: number;
  }>;
  byAgent: Array<{
    agent: string;
    tokens: number;
    cost: number;
    executions: number;
  }>;
  trend: {
    tokensChange: number;
    costChange: number;
  };
  period: string;
}

/**
 * Get token usage summary
 * @param range - Time range (7d, 30d, 90d)
 */
export async function getTokenUsage(
  range: string = '30d'
): Promise<TokenStats> {
  const response = await fetch(`${API_URL}/api/tokens/usage?range=${range}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch token usage' }));
    throw new Error(error.error || 'Failed to fetch token usage');
  }
  
  return response.json();
}

// ============================================
// NOTIFICATIONS API (Phase 2.2)
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'workflow' | 'system' | 'team' | 'billing';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  readAt: number | null;
  createdAt: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Get notifications
 * @param unreadOnly - Only return unread notifications
 * @param category - Filter by category
 */
export async function getNotifications(
  unreadOnly: boolean = false,
  category?: string
): Promise<NotificationsResponse> {
  let url = `${API_URL}/api/notifications?unreadOnly=${unreadOnly}`;
  if (category) {
    url += `&category=${category}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch notifications' }));
    throw new Error(error.error || 'Failed to fetch notifications');
  }
  
  return response.json();
}

/**
 * Mark notification as read
 * @param id - Notification ID
 */
export async function markNotificationRead(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to mark as read' }));
    throw new Error(error.error || 'Failed to mark as read');
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to mark all as read' }));
    throw new Error(error.error || 'Failed to mark all as read');
  }
}

/**
 * Delete notification
 * @param id - Notification ID
 */
export async function deleteNotification(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete notification' }));
    throw new Error(error.error || 'Failed to delete notification');
  }
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications(): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/clear-read`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to clear notifications' }));
    throw new Error(error.error || 'Failed to clear notifications');
  }
}
