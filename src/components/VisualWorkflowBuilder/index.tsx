/**
 * Visual Workflow Builder Component
 * 
 * Drag-and-drop visual interface for creating workflows with agents and tasks.
 * Uses ReactFlow for graph rendering and interaction.
 * 
 * @module VisualWorkflowBuilder
 * @version 1.0.0
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import AgentNode from './nodes/AgentNode';
import TaskNode from './nodes/TaskNode';
import { Agent, Task } from '../../types/workflow';
import { getAgentPreset } from '../../config/agentPresets';

interface VisualWorkflowBuilderProps {
  agents: Agent[];
  tasks: Task[];
  onAgentsChange: (agents: Agent[]) => void;
  onTasksChange: (tasks: Task[]) => void;
}

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  agents,
  tasks,
  onAgentsChange,
  onTasksChange,
}) => {
  // Convert agents and tasks to ReactFlow nodes
  const initialNodes = useMemo(() => {
    const agentNodes: Node[] = agents.map((agent, index) => ({
      id: `agent-${agent.id}`,
      type: 'agentNode',
      position: { x: 100, y: index * 150 + 50 },
      data: { agent },
    }));

    const taskNodes: Node[] = tasks.map((task, index) => ({
      id: `task-${task.id}`,
      type: 'taskNode',
      position: { x: 500, y: index * 150 + 50 },
      data: { task, agents },
    }));

    return [...agentNodes, ...taskNodes];
  }, [agents, tasks]);

  // Convert task dependencies to ReactFlow edges
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // Agent -> Task connections
    tasks.forEach((task) => {
      if (task.agentId) {
        edges.push({
          id: `agent-${task.agentId}-task-${task.id}`,
          source: `agent-${task.agentId}`,
          target: `task-${task.id}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      }
    });

    // Task -> Task dependencies
    tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        edges.push({
          id: `task-${depId}-task-${task.id}`,
          source: `task-${depId}`,
          target: `task-${task.id}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#10b981', strokeWidth: 2 },
        });
      });
    });

    return edges;
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes and edges when agents/tasks change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      agentNode: AgentNode,
      taskNode: TaskNode,
    }),
    []
  );

  // Add new agent
  const handleAddAgent = useCallback(() => {
    const preset = getAgentPreset('executor'); // Default to executor for visual builder
    const newAgent: Agent = {
      id: generateId(),
      name: `${preset.displayName} ${agents.length + 1}`,
      role: preset.role,
      model: preset.model,
      description: preset.description,
      capabilities: [...preset.capabilities],
      temperature: preset.temperature,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onAgentsChange([...agents, newAgent]);
  }, [agents, onAgentsChange]);

  // Add new task
  const handleAddTask = useCallback(() => {
    const newTask: Task = {
      id: generateId(),
      name: `Task ${tasks.length + 1}`,
      description: '',
      agentId: agents.length > 0 ? agents[0].id : '',
      status: 'pending',
      dependencies: [],
      input: { prompt: '' },
      retryCount: 0,
      maxRetries: 3,
    };
    onTasksChange([...tasks, newTask]);
  }, [tasks, agents, onTasksChange]);

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceType = connection.source.startsWith('agent-') ? 'agent' : 'task';
      const targetType = connection.target.startsWith('task-') ? 'task' : 'unknown';

      // Only allow agent->task and task->task connections
      if (targetType !== 'task') return;

      if (sourceType === 'agent') {
        // Assign agent to task
        const agentId = connection.source.replace('agent-', '');
        const taskId = connection.target.replace('task-', '');

        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, agentId } : task
        );
        onTasksChange(updatedTasks);
      } else if (sourceType === 'task') {
        // Add task dependency
        const sourceTaskId = connection.source.replace('task-', '');
        const targetTaskId = connection.target.replace('task-', '');

        const updatedTasks = tasks.map((task) => {
          if (task.id === targetTaskId && !task.dependencies.includes(sourceTaskId)) {
            return { ...task, dependencies: [...task.dependencies, sourceTaskId] };
          }
          return task;
        });
        onTasksChange(updatedTasks);
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [tasks, onTasksChange, setEdges]
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handleAddAgent}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Add Agent</span>
        </button>
        <button
          onClick={handleAddTask}
          disabled={agents.length === 0}
          style={{
            padding: '8px 16px',
            background: agents.length === 0
              ? '#9ca3af'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: agents.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Add Task</span>
        </button>
      </div>
      
      {/* Canvas */}
      <div style={{ width: '100%', height: '600px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
      </div>
    </div>
  );
};

export default VisualWorkflowBuilder;
