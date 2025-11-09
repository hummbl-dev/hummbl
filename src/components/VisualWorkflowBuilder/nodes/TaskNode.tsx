/**
 * Task Node Component for Visual Workflow Builder
 * 
 * Displays a task as a visual node with input/output handles for dependencies.
 * 
 * @module TaskNode
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Task, Agent } from '../../../types/workflow';

interface TaskNodeData {
  task: Task;
  agents: Agent[];
}

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data }) => {
  const { task, agents } = data;
  
  // Find assigned agent
  const assignedAgent = agents.find((a) => a.id === task.agentId);
  
  // Truncate prompt for display
  const promptPreview = (task.input as { prompt?: string })?.prompt
    ? ((task.input as { prompt: string }).prompt.substring(0, 60) + '...')
    : task.description;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        minWidth: '220px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #ec4899',
      }}
    >
      {/* Input handles for agent assignment and dependencies */}
      <Handle
        type="target"
        position={Position.Left}
        id="task-agent-input"
        style={{ background: '#3b82f6', width: '12px', height: '12px', top: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="task-dep-input"
        style={{ background: '#10b981', width: '12px', height: '12px', top: '70%' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px', marginRight: '8px' }}>📋</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.name}</div>
          {assignedAgent && (
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              → {assignedAgent.name}
            </div>
          )}
        </div>
      </div>

      {promptPreview && (
        <div
          style={{
            fontSize: '11px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 8px',
            borderRadius: '4px',
            marginTop: '8px',
            maxHeight: '40px',
            overflow: 'hidden',
          }}
        >
          {promptPreview}
        </div>
      )}

      {task.dependencies.length > 0 && (
        <div
          style={{
            fontSize: '10px',
            marginTop: '8px',
            opacity: 0.8,
          }}
        >
          Depends on: {task.dependencies.length} task{task.dependencies.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Output handle for chaining to other tasks */}
      <Handle
        type="source"
        position={Position.Right}
        id="task-output"
        style={{ background: '#10b981', width: '12px', height: '12px' }}
      />
    </div>
  );
};

export default TaskNode;
