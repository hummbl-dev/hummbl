import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Agent, Env, Task } from '../types/index';
import { executeWorkflow, executeTask } from './workflows.ts';

const dbMocks = vi.hoisted(() => {
  const updateExecutionStatus = vi.fn(async () => ({ ok: true, value: undefined }));
  const createTaskResult = vi.fn(async () => ({ ok: true, value: undefined }));
  const updateTaskResult = vi.fn(async () => ({ ok: true, value: undefined }));

  return {
    createExecution: vi.fn(),
    createTaskResult,
    updateTaskResult,
    updateExecutionStatus,
    getExecution: vi.fn(),
    getTaskResults: vi.fn(),
    incrementRetryCount: vi.fn(),
  };
});

vi.mock('../lib/db.ts', () => dbMocks);

const { createTaskResult, updateTaskResult, updateExecutionStatus } = dbMocks;

const aiMocks = vi.hoisted(() => {
  const createAIProvider = vi.fn(() => ({
    ok: true,
    value: { name: 'anthropic', apiKey: 'provider-key', model: 'claude-4-haiku' },
  }));

  const callAI = vi.fn(async () => ({
    ok: true,
    value: {
      content: 'Result payload',
      provider: 'anthropic',
      model: 'claude-4-haiku',
    },
  }));

  return { createAIProvider, callAI };
});

vi.mock('../services/ai.ts', () => aiMocks);

const { createAIProvider, callAI } = aiMocks;

const baseEnv: Env = {
  DB: {} as unknown as D1Database,
  CACHE: {} as unknown as KVNamespace,
  ANTHROPIC_API_KEY: 'env-claude',
  OPENAI_API_KEY: 'env-openai',
  ENV: 'test',
};

const agent: Agent = {
  id: 'agent-1',
  name: 'Executor',
  role: 'executor',
  description: 'Test agent',
  capabilities: ['test'],
  model: 'claude-4-haiku',
  temperature: 0.5,
};

const baseTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Gather',
    description: 'First task',
    agentId: 'agent-1',
    dependencies: [],
    status: 'pending',
    input: {},
    retryCount: 0,
    maxRetries: 1,
  },
  {
    id: 'task-2',
    name: 'Process',
    description: 'Second task',
    agentId: 'agent-1',
    dependencies: ['task-1'],
    status: 'pending',
    input: {},
    retryCount: 0,
    maxRetries: 1,
  },
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

beforeEach(() => {
  updateExecutionStatus.mockClear();
  createTaskResult.mockClear();
  updateTaskResult.mockClear();
  createAIProvider.mockClear();
  callAI.mockReset();
  callAI.mockResolvedValue({
    ok: true,
    value: {
      content: 'Result payload',
      provider: 'anthropic',
      model: 'claude-4-haiku',
    },
  });
});

describe('executeWorkflow', () => {
  it('executes tasks in dependency order and marks completion', async () => {
    await executeWorkflow(
      baseEnv,
      'execution-123',
      { id: 'workflow-1', tasks: clone(baseTasks), agents: [clone(agent)] },
      {},
      {}
    );

    expect(createTaskResult).toHaveBeenCalledTimes(2);
    expect(callAI).toHaveBeenCalledTimes(2);
    expect(updateTaskResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.objectContaining({
        status: 'completed',
      })
    );
    expect(updateExecutionStatus).toHaveBeenCalledTimes(1);
    const [, execId, status, error] = updateExecutionStatus.mock.calls[0];
    expect(execId).toBe('execution-123');
    expect(status).toBe('completed');
    expect(error).toBeUndefined();
  });

  it('marks execution as failed when a task fails', async () => {
    callAI.mockResolvedValueOnce({
      ok: false,
      error: 'provider error',
    });

    await executeWorkflow(
      baseEnv,
      'execution-456',
      { id: 'workflow-2', tasks: clone(baseTasks), agents: [clone(agent)] },
      {},
      {}
    );

    expect(updateTaskResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.objectContaining({
        status: 'failed',
        error: 'provider error',
      })
    );

    expect(updateExecutionStatus).toHaveBeenCalledTimes(1);
    const [, failedExecId, failedStatus, failedError] = updateExecutionStatus.mock.calls[0];
    expect(failedExecId).toBe('execution-456');
    expect(failedStatus).toBe('failed');
    expect(failedError).toBe('One or more tasks failed');
  });
});

describe('executeTask (backend)', () => {
  it('returns failure when the agent cannot be found', async () => {
    const result = await executeTask(
      baseEnv,
      'execution-789',
      { ...clone(baseTasks[0]), agentId: 'missing-agent' },
      [clone(agent)],
      {},
      new Map()
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Agent not found');
    expect(createTaskResult).toHaveBeenCalled();
    expect(updateTaskResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.objectContaining({
        status: 'failed',
      })
    );
  });

  it('completes successfully and stores output when provider succeeds', async () => {
    callAI.mockResolvedValueOnce({
      ok: true,
      value: {
        content: { message: 'done' },
        provider: 'anthropic',
        model: 'claude-4-haiku',
      },
    });

    const result = await executeTask(
      baseEnv,
      'execution-999',
      clone(baseTasks[0]),
      [clone(agent)],
      {},
      new Map()
    );

    expect(result.ok).toBe(true);
    expect(result.output).toEqual({ message: 'done' });
    expect(updateTaskResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.objectContaining({
        status: 'completed',
        output: { message: 'done' },
      })
    );
  });

  it('propagates provider errors', async () => {
    callAI.mockResolvedValueOnce({
      ok: false,
      error: 'provider failure',
    });

    const result = await executeTask(
      baseEnv,
      'execution-error',
      clone(baseTasks[0]),
      [clone(agent)],
      {},
      new Map()
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe('provider failure');
    expect(updateTaskResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.objectContaining({
        status: 'failed',
        error: 'provider failure',
      })
    );
  });
});

