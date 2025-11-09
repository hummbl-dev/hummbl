/**
 * HUMMBL Full Workflow Editor
 * Complete editor with agents and tasks
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import { Save, X, Plus, Trash2, ChevronDown, ChevronUp, Eye, Code } from 'lucide-react';
import type { Agent, Task, AgentRole } from '../types/workflow';
import VisualWorkflowBuilder from '../components/VisualWorkflowBuilder';
import { AGENT_PRESETS, getAgentPreset } from '../config/agentPresets';

export default function WorkflowEditorFull() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addWorkflow = useWorkflowStore((state) => state.addWorkflow);
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const getWorkflow = useWorkflowStore((state) => state.getWorkflow);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['agents', 'tasks']));
  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');

  useEffect(() => {
    if (id) {
      const workflow = getWorkflow(id);
      if (workflow) {
        setName(workflow.name);
        setDescription(workflow.description);
        setTags(workflow.tags);
        setAgents(workflow.agents);
        setTasks(workflow.tasks);
      }
    }
  }, [id, getWorkflow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (id) {
      updateWorkflow(id, {
        name,
        description,
        tags,
        agents,
        tasks,
      });
    } else {
      addWorkflow({
        name,
        description,
        status: 'draft',
        tasks,
        agents,
        tags,
      });
    }

    navigate('/workflows');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Agent Management
  const handleAddAgent = (role: AgentRole = 'executor') => {
    const preset = getAgentPreset(role);
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: `${preset.displayName} ${agents.length + 1}`,
      role: preset.role,
      description: preset.description,
      capabilities: [...preset.capabilities],
      model: preset.model,
      temperature: preset.temperature,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAgents([...agents, newAgent]);
  };

  const handleUpdateAgent = (agentId: string, updates: Partial<Agent>) => {
    setAgents(agents.map((agent) =>
      agent.id === agentId ? { ...agent, ...updates, updatedAt: new Date() } : agent
    ));
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter((agent) => agent.id !== agentId));
    // Remove agent from tasks
    setTasks(tasks.map((task) =>
      task.agentId === agentId ? { ...task, agentId: '' } : task
    ));
  };

  // Task Management
  const handleAddTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: `Task ${tasks.length + 1}`,
      description: '',
      agentId: agents.length > 0 ? agents[0].id : '',
      dependencies: [],
      status: 'pending',
      input: { prompt: '' },
      retryCount: 0,
      maxRetries: 2,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    // Remove dependencies
    setTasks(tasks.map((task) => ({
      ...task,
      dependencies: task.dependencies.filter((dep) => dep !== taskId),
    })));
  };

  const handleUpdateTaskPrompt = (taskId: string, prompt: string) => {
    handleUpdateTask(taskId, { input: { prompt } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Workflow' : 'Create New Workflow'}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure agents, tasks, and dependencies
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          
          <div>
            <label htmlFor="name" className="label">Workflow Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g., HUMMBL System Analyzer"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="What does this workflow do?"
              required
            />
          </div>

          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Workflow Builder</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  viewMode === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Workflow Builder */}
        {viewMode === 'visual' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Visual Workflow Canvas</h3>
            <VisualWorkflowBuilder
              agents={agents}
              tasks={tasks}
              onAgentsChange={setAgents}
              onTasksChange={setTasks}
            />
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Connect agents to tasks by dragging from the agent node to the task node. 
                Connect tasks to create dependencies.
              </p>
            </div>
          </div>
        )}

        {/* Text-Based Editor (only shown in text mode) */}
        {viewMode === 'text' && (
          <>
            {/* Agents Section */}
            <div className="card">
          <button
            type="button"
            onClick={() => toggleSection('agents')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-xl font-bold text-gray-900">AI Agents ({agents.length})</h2>
            {expandedSections.has('agents') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.has('agents') && (
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Agent #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-sm">Agent Name</label>
                      <input
                        type="text"
                        value={agent.name}
                        onChange={(e) => handleUpdateAgent(agent.id, { name: e.target.value })}
                        className="input-field"
                        placeholder="e.g., Research Agent"
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Model</label>
                      <select
                        value={agent.model}
                        onChange={(e) => handleUpdateAgent(agent.id, { model: e.target.value })}
                        className="input-field"
                      >
                        <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                        <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label text-sm">Description</label>
                    <textarea
                      value={agent.description}
                      onChange={(e) => handleUpdateAgent(agent.id, { description: e.target.value })}
                      className="input-field"
                      rows={2}
                      placeholder="What does this agent do?"
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Temperature: {agent.temperature}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={agent.temperature}
                      onChange={(e) => handleUpdateAgent(agent.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Focused (0)</span>
                      <span>Creative (1)</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Add Agent Presets */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Agent</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(AGENT_PRESETS).filter(p => p.role !== 'custom').map((preset) => (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddAgent(preset.role);
                      }}
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{preset.icon}</span>
                        <span className="font-medium text-gray-900 group-hover:text-primary-700">
                          {preset.displayName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 group-hover:text-gray-700">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  💡 Each preset includes optimized model, temperature, and capabilities
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="card">
          <button
            type="button"
            onClick={() => toggleSection('tasks')}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-xl font-bold text-gray-900">Tasks ({tasks.length})</h2>
            {expandedSections.has('tasks') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.has('tasks') && (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Task #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="label text-sm">Task Name</label>
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => handleUpdateTask(task.id, { name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Analyze System Architecture"
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Description</label>
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                      className="input-field"
                      placeholder="Brief description"
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Assign to Agent</label>
                    <select
                      value={task.agentId}
                      onChange={(e) => handleUpdateTask(task.id, { agentId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label text-sm">Prompt / Instructions</label>
                    <textarea
                      value={(task.input as { prompt?: string })?.prompt || ''}
                      onChange={(e) => handleUpdateTaskPrompt(task.id, e.target.value)}
                      className="input-field font-mono text-sm"
                      rows={6}
                      placeholder="Enter the prompt or instructions for this task. Include context, requirements, and expected output format."
                    />
                  </div>

                  <div>
                    <label className="label text-sm">Depends on Tasks</label>
                    <div className="space-y-1">
                      {tasks.filter(t => t.id !== task.id).map((otherTask, otherIndex) => (
                        <label key={otherTask.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={task.dependencies.includes(otherTask.id)}
                            onChange={(e) => {
                              const newDeps = e.target.checked
                                ? [...task.dependencies, otherTask.id]
                                : task.dependencies.filter(d => d !== otherTask.id);
                              handleUpdateTask(task.id, { dependencies: newDeps });
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Task #{otherIndex + 1}: {otherTask.name}</span>
                        </label>
                      ))}
                      {tasks.filter(t => t.id !== task.id).length === 0 && (
                        <p className="text-sm text-gray-500 italic">No other tasks available</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddTask}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
                disabled={agents.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
              {agents.length === 0 && (
                <p className="text-sm text-amber-600">⚠️ Add at least one agent before creating tasks</p>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0 pb-4">
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={agents.length === 0 || tasks.length === 0}
          >
            <Save className="h-4 w-4" />
            <span>{id ? 'Update Workflow' : 'Create Workflow'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
