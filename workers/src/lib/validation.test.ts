import { describe, it, expect } from 'vitest';
import {
  validate,
  TaskSchema,
  AgentSchema,
  WorkflowDataSchema,
  ExecuteWorkflowRequestSchema,
} from './validation';

describe('validate', () => {
  it('should return success for valid data', () => {
    const schema = TaskSchema;
    const validTask = {
      id: 'task-1',
      name: 'Test Task',
      description: 'Test description',
      status: 'pending',
      dependencies: [],
      agentId: 'agent-1',
      estimatedTokens: 1000,
    };

    const result = validate(schema, validTask);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validTask);
    }
  });

  it('should return errors for invalid data', () => {
    const schema = TaskSchema;
    const invalidTask = {
      id: 'task-1',
      // Missing required 'name' field
      status: 'invalid-status',
    };

    const result = validate(schema, invalidTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field.includes('name'))).toBe(true);
    }
  });

    it('should format error messages with field', () => {
    const schema = TaskSchema;
    const invalidTask = {
      id: 'task-1',
      name: '', // Empty name
      status: 'pending',
    };

    const result = validate(schema, invalidTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toHaveProperty('field');
      expect(result.errors[0]).toHaveProperty('message');
    }
  });
});

describe('TaskSchema', () => {
  it('should validate complete task', () => {
    const validTask = {
      id: 'task-123',
      name: 'Data Analysis',
      description: 'Analyze user behavior data',
      status: 'pending' as const,
      dependencies: ['task-100', 'task-101'],
      agentId: 'agent-ai-1',
      estimatedTokens: 5000,
      result: 'Analysis complete',
    };

    const result = validate(TaskSchema, validTask);
    expect(result.success).toBe(true);
  });

  it('should accept valid task status values', () => {
    const statuses = ['pending', 'running', 'completed', 'failed', 'skipped'];

    statuses.forEach(status => {
      const task = {
        id: 'task-1',
        name: 'Test',
        status,
        dependencies: [],
        agentId: 'agent-1',
      };

      const result = validate(TaskSchema, task);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid task status', () => {
    const invalidTask = {
      id: 'task-1',
      name: 'Test',
      status: 'invalid-status',
      dependencies: [],
      agentId: 'agent-1',
    };

    const result = validate(TaskSchema, invalidTask);
    expect(result.success).toBe(false);
  });

  it('should require id, name, status, and agentId', () => {
    const incompleteTask = {
      id: 'task-1',
      // Missing name
      status: 'pending',
      agentId: 'agent-1',
    };

    const result = validate(TaskSchema, incompleteTask);
    expect(result.success).toBe(false);
  });
});

describe('AgentSchema', () => {
  it('should validate complete agent', () => {
    const validAgent = {
      id: 'agent-123',
      name: 'Research Agent',
      description: 'Conducts research tasks',
      systemPrompt: 'You are a research assistant...',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      capabilities: ['research', 'analysis'],
    };

    const result = validate(AgentSchema, validAgent);
    expect(result.success).toBe(true);
  });

  it('should validate temperature range', () => {
    const agentLowTemp = {
      id: 'agent-1',
      name: 'Test',
      model: 'gpt-4',
      temperature: 0,
    };

    const agentHighTemp = {
      id: 'agent-2',
      name: 'Test',
      model: 'gpt-4',
      temperature: 2,
    };

    expect(validate(AgentSchema, agentLowTemp).success).toBe(true);
    expect(validate(AgentSchema, agentHighTemp).success).toBe(true);
  });

  it('should reject temperature outside range', () => {
    const agentInvalidTemp = {
      id: 'agent-1',
      name: 'Test',
      model: 'gpt-4',
      temperature: 3, // Too high
    };

    const result = validate(AgentSchema, agentInvalidTemp);
    expect(result.success).toBe(false);
  });
});

describe('WorkflowDataSchema', () => {
  it('should validate workflow with tasks and agents', () => {
    const validWorkflow = {
      name: 'Data Pipeline',
      description: 'Process and analyze data',
      tasks: [
        {
          id: 'task-1',
          name: 'Extract',
          status: 'pending',
          dependencies: [],
          agentId: 'agent-1',
        },
      ],
      agents: [
        {
          id: 'agent-1',
          name: 'Extractor',
          model: 'gpt-4',
        },
      ],
    };

    const result = validate(WorkflowDataSchema, validWorkflow);
    expect(result.success).toBe(true);
  });

  it('should require name and tasks', () => {
    const incompleteWorkflow = {
      // Missing name
      tasks: [],
      agents: [],
    };

    const result = validate(WorkflowDataSchema, incompleteWorkflow);
    expect(result.success).toBe(false);
  });
});

describe('ExecuteWorkflowRequestSchema', () => {
  it('should validate execution request with input', () => {
    const validRequest = {
      workflowData: {
        name: 'Test Workflow',
        tasks: [
          {
            id: 'task-1',
            name: 'Task 1',
            status: 'pending',
            dependencies: [],
            agentId: 'agent-1',
          },
        ],
        agents: [
          {
            id: 'agent-1',
            name: 'Agent 1',
            model: 'gpt-4',
          },
        ],
      },
      input: { userId: '123', query: 'test' },
    };

    const result = validate(ExecuteWorkflowRequestSchema, validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate execution request without input', () => {
    const validRequest = {
      workflowData: {
        name: 'Test Workflow',
        tasks: [
          {
            id: 'task-1',
            name: 'Task 1',
            status: 'pending',
            dependencies: [],
            agentId: 'agent-1',
          },
        ],
        agents: [
          {
            id: 'agent-1',
            name: 'Agent 1',
            model: 'gpt-4',
          },
        ],
      },
    };

    const result = validate(ExecuteWorkflowRequestSchema, validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject request with invalid workflowData', () => {
    const invalidRequest = {
      workflowData: {
        // Missing required fields
        tasks: [],
      },
    };

    const result = validate(ExecuteWorkflowRequestSchema, invalidRequest);
    expect(result.success).toBe(false);
  });
});
