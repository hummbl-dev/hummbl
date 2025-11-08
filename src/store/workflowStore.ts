import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, Agent, Task, ExecutionLog, WorkflowTemplate } from '../types/workflow';

interface WorkflowStore {
  workflows: Workflow[];
  agents: Agent[];
  executionLogs: ExecutionLog[];
  templates: WorkflowTemplate[];

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
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: [],
  agents: [],
  executionLogs: [],
  templates: [],

  // Workflow operations
  addWorkflow: (workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
  },

  updateWorkflow: (id, updates) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      ),
    }));
  },

  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
      executionLogs: state.executionLogs.filter((log) => log.workflowId !== id),
    }));
  },

  getWorkflow: (id) => {
    return get().workflows.find((w) => w.id === id);
  },

  // Agent operations
  addAgent: (agent) => {
    const newAgent: Agent = {
      ...agent,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ agents: [...state.agents, newAgent] }));
  },

  updateAgent: (id, updates) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      ),
    }));
  },

  deleteAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    }));
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
    const workflow = get().getWorkflow(id);
    if (!workflow) return;

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
  },

  pauseWorkflow: (id) => {
    const workflow = get().getWorkflow(id);
    if (!workflow) return;

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
  },

  stopWorkflow: (id) => {
    const workflow = get().getWorkflow(id);
    if (!workflow) return;

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
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

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
  },
}));
