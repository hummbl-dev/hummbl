import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, Agent, Task, ExecutionLog, WorkflowTemplate } from '../types/workflow';

interface WorkflowStore {
  workflows: Workflow[];
  agents: Agent[];
  executionLogs: ExecutionLog[];
  templates: WorkflowTemplate[];
  errors: string[];

  // Workflow operations
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  getWorkflow: (id: string) => Workflow | undefined;

  // Agent operations
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;

  // Task operations
  updateTask: (workflowId: string, taskId: string, updates: Partial<Task>) => void;
  addTaskToWorkflow: (workflowId: string, task: Omit<Task, 'id'>) => void;

  // Execution operations
  startWorkflow: (id: string) => void;
  pauseWorkflow: (id: string) => void;
  stopWorkflow: (id: string) => void;

  // Log operations
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  getWorkflowLogs: (workflowId: string) => ExecutionLog[];

  // Template operations
  addTemplate: (template: WorkflowTemplate) => void;
  createWorkflowFromTemplate: (templateId: string, name: string) => void;

  // Error handling
  addError: (error: string) => void;
  clearErrors: () => void;
  clearOldLogs: (daysToKeep?: number) => void;
}

// Helper function to convert date strings back to Date objects
const deserializeDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Check if string looks like ISO date
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeDates);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = deserializeDates(obj[key]);
    }
    return result;
  }

  return obj;
// Safe localStorage wrapper with error handling
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
  workflows: [],
  agents: [],
  executionLogs: [],
  templates: [],
  errors: [],

  // Workflow operations
  addWorkflow: (workflow) => {
    try {
      const newWorkflow: Workflow = {
        ...workflow,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add workflow';
      get().addError(errorMessage);
      console.error('Error adding workflow:', error);
    }
  },

  updateWorkflow: (id, updates) => {
    try {
      const workflow = get().getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }
      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update workflow';
      get().addError(errorMessage);
      console.error('Error updating workflow:', error);
    }
  },

  deleteWorkflow: (id) => {
    try {
      const workflow = get().getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        executionLogs: state.executionLogs.filter((log) => log.workflowId !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workflow';
      get().addError(errorMessage);
      console.error('Error deleting workflow:', error);
    }
  },

  getWorkflow: (id) => {
    return get().workflows.find((w) => w.id === id);
  },

  // Agent operations
  addAgent: (agent) => {
    try {
      const newAgent: Agent = {
        ...agent,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ agents: [...state.agents, newAgent] }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add agent';
      get().addError(errorMessage);
      console.error('Error adding agent:', error);
    }
  },

  updateAgent: (id, updates) => {
    try {
      const agent = get().getAgent(id);
      if (!agent) {
        throw new Error(`Agent with id ${id} not found`);
      }
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update agent';
      get().addError(errorMessage);
      console.error('Error updating agent:', error);
    }
  },

  deleteAgent: (id) => {
    try {
      const agent = get().getAgent(id);
      if (!agent) {
        throw new Error(`Agent with id ${id} not found`);
      }
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent';
      get().addError(errorMessage);
      console.error('Error deleting agent:', error);
    }
  },

  getAgent: (id) => {
    return get().agents.find((a) => a.id === id);
  },

  // Task operations
  updateTask: (workflowId, taskId, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
              updatedAt: new Date(),
            }
          : w
      ),
    }));
  },

  addTaskToWorkflow: (workflowId, task) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
    };
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === workflowId
          ? { ...w, tasks: [...w.tasks, newTask], updatedAt: new Date() }
          : w
      ),
    }));
  },

  // Execution operations
  startWorkflow: (id) => {
    try {
      const workflow = get().getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }

      if (workflow.tasks.length === 0) {
        throw new Error('Cannot start workflow: No tasks configured');
      }

      if (workflow.agents.length === 0) {
        throw new Error('Cannot start workflow: No agents configured');
      }

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id
            ? {
                ...w,
                status: 'active',
                startedAt: new Date(),
                updatedAt: new Date(),
              }
            : w
        ),
      }));

      get().addLog({
        workflowId: id,
        taskId: '',
        level: 'info',
        message: `Workflow "${workflow.name}" started`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workflow';
      get().addError(errorMessage);
      console.error('Error starting workflow:', error);

      // Mark workflow as failed if it exists
      const workflow = get().getWorkflow(id);
      if (workflow) {
        get().updateWorkflow(id, { status: 'failed' });
        get().addLog({
          workflowId: id,
          taskId: '',
          level: 'error',
          message: `Failed to start workflow: ${errorMessage}`,
        });
      }
    }
  },

  pauseWorkflow: (id) => {
    try {
      const workflow = get().getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }

      if (workflow.status !== 'active') {
        throw new Error('Can only pause active workflows');
      }

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? { ...w, status: 'paused', updatedAt: new Date() } : w
        ),
      }));

      get().addLog({
        workflowId: id,
        taskId: '',
        level: 'info',
        message: `Workflow "${workflow.name}" paused`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause workflow';
      get().addError(errorMessage);
      console.error('Error pausing workflow:', error);
    }
  },

  stopWorkflow: (id) => {
    try {
      const workflow = get().getWorkflow(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id
            ? {
                ...w,
                status: 'completed',
                completedAt: new Date(),
                updatedAt: new Date(),
              }
            : w
        ),
      }));

      get().addLog({
        workflowId: id,
        taskId: '',
        level: 'info',
        message: `Workflow "${workflow.name}" completed`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop workflow';
      get().addError(errorMessage);
      console.error('Error stopping workflow:', error);
    }
  },

  // Log operations
  addLog: (log) => {
    const newLog: ExecutionLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({ executionLogs: [...state.executionLogs, newLog] }));
  },

  getWorkflowLogs: (workflowId) => {
    return get().executionLogs.filter((log) => log.workflowId === workflowId);
  },

  // Template operations
  addTemplate: (template) => {
    set((state) => ({ templates: [...state.templates, template] }));
  },

  createWorkflowFromTemplate: (templateId, name) => {
    try {
      const template = get().templates.find((t) => t.id === templateId);
      if (!template) {
        throw new Error(`Template with id ${templateId} not found`);
      }

      const agents: Agent[] = template.agents.map((a) => ({
        ...a,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const tasks: Task[] = template.tasks.map((t) => ({
        ...t,
        id: uuidv4(),
        status: 'pending',
        retryCount: 0,
      }));

      get().addWorkflow({
        name,
        description: template.description,
        status: 'draft',
        tasks,
        agents,
        tags: template.tags,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workflow from template';
      get().addError(errorMessage);
      console.error('Error creating workflow from template:', error);
    }
  },

  // Error handling
  addError: (error: string) => {
    set((state) => ({
      errors: [...state.errors, error],
    }));

    // Auto-clear error after 10 seconds
    setTimeout(() => {
      set((state) => ({
        errors: state.errors.filter((e) => e !== error),
      }));
    }, 10000);
  },

  clearErrors: () => {
    set({ errors: [] });
  },

  clearOldLogs: (daysToKeep = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    // Create agents with new IDs
    const agents: Agent[] = template.agents.map((a) => ({
      ...a,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Create tasks with new IDs and assign agents by index
    const tasks: Task[] = template.tasks.map((t, index) => {
      const taskId = uuidv4();
      // Assign agent by index (first task gets first agent, etc.)
      const agentId = agents[index % agents.length]?.id || agents[0]?.id || '';
      
      return {
        ...t,
        id: taskId,
        agentId, // Assign the agent
        status: 'pending',
        retryCount: 0,
        dependencies: [], // Will update below
      };
    });

    // Update task dependencies from indices to actual task IDs
    tasks.forEach((task, index) => {
      const templateTask = template.tasks[index];
      if (templateTask.dependencies && templateTask.dependencies.length > 0) {
        task.dependencies = templateTask.dependencies.map((depIndex) => {
          const depIndexNum = parseInt(depIndex, 10);
          return tasks[depIndexNum]?.id || depIndex;
        });
      }
    });

    set((state) => ({
      executionLogs: state.executionLogs.filter(
        (log) => log.timestamp >= cutoffDate
      ),
    }));
  },
}),
    {
      name: 'hummbl-workflow-storage',
      storage: createJSONStorage(() => localStorage),
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        workflows: state.workflows,
        agents: state.agents,
        executionLogs: state.executionLogs,
        templates: state.templates,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects after rehydration
          state.workflows = deserializeDates(state.workflows);
          state.agents = deserializeDates(state.agents);
          state.executionLogs = deserializeDates(state.executionLogs);
        }
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating store:', error);
          } else if (state) {
            console.log('Store rehydrated successfully');
          }
        };
      },
    }
  )
);
