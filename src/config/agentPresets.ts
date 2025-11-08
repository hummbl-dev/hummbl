/**
 * Agent Role Presets
 * 
 * Smart defaults for common agent roles to reduce friction in workflow creation.
 * Each preset includes optimized model selection, temperature, and capabilities.
 * 
 * @module AgentPresets
 * @version 1.0.0
 */

import { AgentRole } from '../types/workflow';

export interface AgentPreset {
  role: AgentRole;
  displayName: string;
  icon: string;
  description: string;
  model: string;
  temperature: number;
  capabilities: string[];
  promptGuidance: string;
}

/**
 * Agent role presets with intelligent defaults
 * 
 * Model Selection Strategy:
 * - Researcher: Haiku (fast, cost-effective for info gathering)
 * - Analyst: Sonnet (balanced reasoning for analysis)
 * - Executor: Haiku (quick task execution)
 * - Reviewer: Sonnet (thorough review and critique)
 */
export const AGENT_PRESETS: Record<AgentRole, AgentPreset> = {
  researcher: {
    role: 'researcher',
    displayName: 'Researcher',
    icon: '🔍',
    description: 'Gathers information, conducts research, summarizes findings',
    model: 'claude-3-haiku-20240307',
    temperature: 0.3,
    capabilities: [
      'Web research',
      'Data extraction',
      'Information synthesis',
      'Fact-checking',
    ],
    promptGuidance: 'Best for: Gathering information, conducting research, summarizing documents',
  },
  analyst: {
    role: 'analyst',
    displayName: 'Analyst',
    icon: '📊',
    description: 'Analyzes data, identifies patterns, provides insights',
    model: 'claude-3-haiku-20240307',
    temperature: 0.5,
    capabilities: [
      'Data analysis',
      'Pattern recognition',
      'Trend identification',
      'Insight generation',
    ],
    promptGuidance: 'Best for: Analyzing data, identifying trends, generating insights',
  },
  executor: {
    role: 'executor',
    displayName: 'Executor',
    icon: '⚡',
    description: 'Executes tasks, performs actions, generates outputs',
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    capabilities: [
      'Content generation',
      'Task execution',
      'Format conversion',
      'Output creation',
    ],
    promptGuidance: 'Best for: Generating content, executing tasks, creating outputs',
  },
  reviewer: {
    role: 'reviewer',
    displayName: 'Reviewer',
    icon: '✅',
    description: 'Reviews work, provides feedback, ensures quality',
    model: 'claude-3-haiku-20240307',
    temperature: 0.4,
    capabilities: [
      'Quality assurance',
      'Feedback generation',
      'Error detection',
      'Improvement suggestions',
    ],
    promptGuidance: 'Best for: Reviewing content, providing feedback, quality control',
  },
  custom: {
    role: 'custom',
    displayName: 'Custom',
    icon: '🎨',
    description: 'Fully customizable agent for specialized tasks',
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    capabilities: [],
    promptGuidance: 'Best for: Specialized tasks that don\'t fit standard roles',
  },
};

/**
 * Get preset configuration for a specific role
 */
export const getAgentPreset = (role: AgentRole): AgentPreset => {
  return AGENT_PRESETS[role];
};

/**
 * Get all available presets as an array
 */
export const getAllPresets = (): AgentPreset[] => {
  return Object.values(AGENT_PRESETS);
};

/**
 * Get preset options for role selection dropdown
 */
export const getPresetOptions = () => {
  return Object.values(AGENT_PRESETS).map((preset) => ({
    value: preset.role,
    label: `${preset.icon} ${preset.displayName}`,
    description: preset.description,
  }));
};
