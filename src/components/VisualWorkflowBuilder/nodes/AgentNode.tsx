/**
 * Agent Node Component for Visual Workflow Builder
 * 
 * Displays an agent as a visual node with output handle for connecting to tasks.
 * 
 * @module AgentNode
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Agent } from '../../../types/workflow';

interface AgentNodeData {
  agent: Agent;
}

const AgentNode: React.FC<NodeProps<AgentNodeData>> = ({ data }) => {
  const { agent } = data;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        minWidth: '200px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '2px solid #5a67d8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{agent.name}</div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>{agent.role}</div>
        </div>
      </div>
      
      <div
        style={{
          fontSize: '11px',
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '4px 8px',
          borderRadius: '4px',
          marginTop: '8px',
        }}
      >
        {agent.model}
      </div>

      {agent.description && (
        <div
          style={{
            fontSize: '11px',
            opacity: 0.8,
            marginTop: '8px',
            maxWidth: '180px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {agent.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="agent-output"
        style={{ background: '#3b82f6', width: '12px', height: '12px' }}
      />
    </div>
  );
};

export default AgentNode;
