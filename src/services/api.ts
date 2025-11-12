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
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}

/**
 * Get auth headers for API requests
 */
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/api/executions`, {
    method: 'POST',
    headers,
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
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/api/executions/${executionId}`, { headers });

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
 * List user's executions
 * @param limit - Maximum number of executions to return (default: 20)
 * @param offset - Offset for pagination (default: 0)
 */
export async function listExecutions(
  limit: number = 20,
  offset: number = 0
): Promise<{
  executions: Array<{
    id: string;
    workflow_id: string;
    workflow_name: string;
    user_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    started_at: string;
    completed_at: string | null;
    error: string | null;
    input: string | null;
  }>;
  limit: number;
  offset: number;
}> {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/executions?limit=${limit}&offset=${offset}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list executions');
  }

  return response.json();
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

// API Key interfaces
export interface ApiKey {
  id: string;
  name: string;
  service: string;
  usageCount: number;
  lastUsedAt: number | null;
  status: string;
  createdAt: number;
}

export interface ApiKeyStats {
  service: string;
  count: number;
  totalUsage: number;
  avgUsage: number;
}

export interface ApiKeyCreateRequest {
  name: string;
  service: string;
  key: string;
}

export interface ApiKeyUpdateRequest {
  name?: string;
  status?: string;
}

/**
 * Get user's API keys
 */
export async function getApiKeys(): Promise<{ keys: ApiKey[] }> {
  const response = await fetch(`${API_URL}/api/keys`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch API keys' }));
    throw new Error(error.error || 'Failed to fetch API keys');
  }

  return response.json();
}

/**
 * Create new API key
 */
export async function createApiKey(keyData: ApiKeyCreateRequest): Promise<{ success: boolean; key: ApiKey }> {
  const response = await fetch(`${API_URL}/api/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(keyData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create API key' }));
    throw new Error(error.error || 'Failed to create API key');
  }

  return response.json();
}

/**
 * Update API key
 */
export async function updateApiKey(id: string, updates: ApiKeyUpdateRequest): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/keys/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update API key' }));
    throw new Error(error.error || 'Failed to update API key');
  }

  return response.json();
}

/**
 * Delete API key
 */
export async function deleteApiKey(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/keys/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete API key' }));
    throw new Error(error.error || 'Failed to delete API key');
  }

  return response.json();
}

/**
 * Get API key usage stats
 */
export async function getApiKeyStats(): Promise<{ stats: ApiKeyStats[] }> {
  const response = await fetch(`${API_URL}/api/keys/stats`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch API key stats' }));
    throw new Error(error.error || 'Failed to fetch API key stats');
  }

  return response.json();
}

/**
 * Validate API key (for external use)
 */
export async function validateApiKey(service: string, key: string): Promise<{ valid: boolean; keyId?: string; name?: string }> {
  const response = await fetch(`${API_URL}/api/keys/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ service, key }),
  });

  if (!response.ok && response.status !== 401) {
    const error = await response.json().catch(() => ({ error: 'Failed to validate API key' }));
    throw new Error(error.error || 'Failed to validate API key');
  }

  return response.json();
}

// User Management interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  invitedBy: string | null;
  joinedAt: number | null;
  lastActiveAt: number | null;
  workflowsCreated: number;
  executionsRun: number;
  createdAt: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  owners: number;
  admins: number;
  members: number;
  viewers: number;
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedByName: string;
  expiresAt: number;
  accepted: boolean;
  acceptedAt: number | null;
  createdAt: number;
}

export interface InviteCreateRequest {
  email: string;
  role: string;
}

export interface WorkflowShareRequest {
  userId: string;
  permissionLevel: 'view' | 'edit' | 'admin';
}

export interface SharedWorkflow {
  id: string;
  name: string;
  description: string;
  status: string;
  permissionLevel: string;
  sharedBy: string;
  sharedByName: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowSharing {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  permissionLevel: string;
  createdAt: number;
}

/**
 * Get all users (admin/owner only)
 */
export async function getUsers(): Promise<{ users: User[] }> {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch users' }));
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/api/users/me`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch user profile' }));
    throw new Error(error.error || 'Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Update user (admin/owner only)
 */
export async function updateUser(id: string, updates: { name?: string; role?: string; status?: string }): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update user' }));
    throw new Error(error.error || 'Failed to update user');
  }

  return response.json();
}

/**
 * Remove user from organization (admin/owner only)
 */
export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete user' }));
    throw new Error(error.error || 'Failed to delete user');
  }

  return response.json();
}

/**
 * Get user statistics (admin/owner only)
 */
export async function getUserStats(): Promise<{ stats: UserStats }> {
  const response = await fetch(`${API_URL}/api/users/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch user stats' }));
    throw new Error(error.error || 'Failed to fetch user stats');
  }

  return response.json();
}

/**
 * Get pending invitations (admin/owner only)
 */
export async function getInvites(): Promise<{ invites: Invite[] }> {
  const response = await fetch(`${API_URL}/api/invites`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch invites' }));
    throw new Error(error.error || 'Failed to fetch invites');
  }

  return response.json();
}

/**
 * Send invitation (admin/owner only)
 */
export async function createInvite(inviteData: InviteCreateRequest): Promise<{ success: boolean; invite: Invite }> {
  const response = await fetch(`${API_URL}/api/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inviteData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create invitation' }));
    throw new Error(error.error || 'Failed to create invitation');
  }

  return response.json();
}

/**
 * Accept invitation
 */
export async function acceptInvite(token: string, userData: { name: string }): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/api/invites/${token}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to accept invitation' }));
    throw new Error(error.error || 'Failed to accept invitation');
  }

  return response.json();
}

/**
 * Cancel invitation (admin/owner only)
 */
export async function deleteInvite(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/invites/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to cancel invitation' }));
    throw new Error(error.error || 'Failed to cancel invitation');
  }

  return response.json();
}

/**
 * Share workflow with team member
 */
export async function shareWorkflow(workflowId: string, shareData: WorkflowShareRequest): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shareData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to share workflow' }));
    throw new Error(error.error || 'Failed to share workflow');
  }

  return response.json();
}

/**
 * Get workflows shared with current user
 */
export async function getSharedWorkflows(): Promise<{ workflows: SharedWorkflow[] }> {
  const response = await fetch(`${API_URL}/api/workflows/shared`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch shared workflows' }));
    throw new Error(error.error || 'Failed to fetch shared workflows');
  }

  return response.json();
}

/**
 * Remove workflow sharing
 */
export async function removeWorkflowSharing(workflowId: string, userId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/share/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to remove workflow sharing' }));
    throw new Error(error.error || 'Failed to remove workflow sharing');
  }

  return response.json();
}

/**
 * Get workflow sharing permissions
 */
export async function getWorkflowSharing(workflowId: string): Promise<{ sharing: WorkflowSharing[] }> {
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/sharing`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch workflow sharing' }));
    throw new Error(error.error || 'Failed to fetch workflow sharing');
  }

  return response.json();
}
