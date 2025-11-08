/**
 * Edge Synchronization Hook for Visual Workflow Builder
 * 
 * Manages edge state synchronization between agents and tasks in the workflow graph.
 * Implements automatic edge creation, validation, and cleanup using P1 (Frame) and SY8 (Emergence).
 * 
 * @module useEdgeSync
 * @version 1.0.0
 * @see https://hummbl.io/docs/visual-workflow-builder
 */

import { useCallback, useEffect } from 'react';
import { Edge, useReactFlow } from 'reactflow';

interface EdgeSyncConfig {
  autoConnect?: boolean;
  validateConnections?: boolean;
  syncInterval?: number;
}

interface EdgeSyncResult {
  syncEdges: () => void;
  validateEdge: (edge: Edge) => boolean;
  cleanupOrphanedEdges: () => void;
}

/**
 * Hook for synchronizing edges between workflow nodes
 * Using SY8 (Systems - Meta-systems): Emergent edge patterns from node relationships
 * 
 * @param config - Configuration for edge synchronization
 * @returns Edge sync utilities
 */
export const useEdgeSync = (config: EdgeSyncConfig = {}): EdgeSyncResult => {
  const { autoConnect = true, validateConnections = true, syncInterval = 1000 } = config;
  const { getNodes, getEdges, setEdges } = useReactFlow();

  /**
   * Validates if an edge connection is valid
   * Using P1 (Perspective - Frame): Define valid connection rules
   */
  const validateEdge = useCallback((edge: Edge): boolean => {
    if (!validateConnections) return true;

    const nodes = getNodes();
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return false;

    // Agent nodes can only connect to Task nodes
    if (sourceNode.type === 'agentNode' && targetNode.type !== 'taskNode') {
      return false;
    }

    // Task nodes can connect to other Task nodes (dependencies)
    if (sourceNode.type === 'taskNode' && targetNode.type === 'taskNode') {
      // Check for circular dependencies using DE3 (Decomposition)
      const visited = new Set<string>();
      const hasCycle = (nodeId: string): boolean => {
        if (visited.has(nodeId)) return true;
        visited.add(nodeId);

        const outgoingEdges = getEdges().filter((e) => e.source === nodeId);
        return outgoingEdges.some((e) => hasCycle(e.target));
      };

      if (hasCycle(edge.target)) {
        return false;
      }
    }

    return true;
  }, [validateConnections, getNodes, getEdges]);

  /**
   * Removes edges that no longer have valid source/target nodes
   * Using DE3 (Decomposition - Break down): Clean up orphaned connections
   */
  const cleanupOrphanedEdges = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const nodeIds = new Set(nodes.map((n) => n.id));

    const validEdges = edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    if (validEdges.length !== edges.length) {
      setEdges(validEdges);
    }
  }, [getNodes, getEdges, setEdges]);

  /**
   * Synchronizes edges based on current node state
   * Using CO5 (Composition - Build up): Integrate node relationships
   */
  const syncEdges = useCallback(() => {
    cleanupOrphanedEdges();

    if (!autoConnect) return;

    const nodes = getNodes();
    const edges = getEdges();
    const agentNodes = nodes.filter((n) => n.type === 'agentNode');
    const taskNodes = nodes.filter((n) => n.type === 'taskNode');

    const newEdges: Edge[] = [...edges];
    let edgesAdded = 0;

    // Auto-connect agents to their assigned tasks
    taskNodes.forEach((taskNode) => {
      const taskData = taskNode.data as { task?: { agentId?: string } };
      const agentId = taskData?.task?.agentId;

      if (!agentId) return;

      const agentNode = agentNodes.find((n) => n.data.agent?.id === agentId);
      if (!agentNode) return;

      const edgeId = `${agentNode.id}-${taskNode.id}`;
      const edgeExists = edges.some((e) => e.id === edgeId);

      if (!edgeExists) {
        const newEdge: Edge = {
          id: edgeId,
          source: agentNode.id,
          target: taskNode.id,
          sourceHandle: 'agent-output',
          targetHandle: 'task-agent-input',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        };

        if (validateEdge(newEdge)) {
          newEdges.push(newEdge);
          edgesAdded++;
        }
      }
    });

    // Auto-connect task dependencies
    taskNodes.forEach((taskNode) => {
      const taskData = taskNode.data as { task?: { dependencies?: string[] } };
      const dependencies = taskData?.task?.dependencies || [];

      dependencies.forEach((depId) => {
        const depNode = taskNodes.find((n) => n.data.task?.id === depId);
        if (!depNode) return;

        const edgeId = `${depNode.id}-${taskNode.id}-dep`;
        const edgeExists = edges.some((e) => e.id === edgeId);

        if (!edgeExists) {
          const newEdge: Edge = {
            id: edgeId,
            source: depNode.id,
            target: taskNode.id,
            sourceHandle: 'task-output',
            targetHandle: 'task-dep-input',
            type: 'smoothstep',
            style: { stroke: '#10b981', strokeWidth: 2 },
          };

          if (validateEdge(newEdge)) {
            newEdges.push(newEdge);
            edgesAdded++;
          }
        }
      });
    });

    if (edgesAdded > 0) {
      setEdges(newEdges);
    }
  }, [autoConnect, getNodes, getEdges, setEdges, validateEdge, cleanupOrphanedEdges]);

  // Periodic sync using RE4 (Recursion - Iteration)
  useEffect(() => {
    if (!autoConnect) return;

    const intervalId = setInterval(syncEdges, syncInterval);
    return () => clearInterval(intervalId);
  }, [autoConnect, syncEdges, syncInterval]);

  // Initial sync
  useEffect(() => {
    syncEdges();
  }, [syncEdges]);

  return {
    syncEdges,
    validateEdge,
    cleanupOrphanedEdges,
  };
};
