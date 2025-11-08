/**
 * Agent Role Presets
 * 
 * Smart defaults for common agent roles to reduce friction in workflow creation.
 * Each preset includes optimized model selection, temperature, and capabilities.
 * 
 * Users can override the default model with any model their API key supports.
 * See aiModels.ts for full catalog.
 * 
 * @module AgentPresets
 * @version 2.0.0
 */

import { AgentRole } from '../types/workflow';
import { DEFAULT_MODELS } from './aiModels';

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
 * Model Selection Strategy (v2.0):
 * - Researcher: Fast model (Haiku 4) for quick info gathering
 * - Analyst: Balanced model (Sonnet 4) for deep reasoning
 * - Executor: Fast model (Haiku 4) for quick generation
 * - Reviewer: Balanced model (Sonnet 4) for thorough review
 * - Custom: Fast model (Haiku 4) as flexible default
 * 
 * Users can override with any model from aiModels.ts catalog.
 */
export const AGENT_PRESETS: Record<AgentRole, AgentPreset> = {
  researcher: {
    role: 'researcher',
    displayName: 'Researcher',
    icon: '🔍',
    description: 'Gathers information, conducts research, summarizes findings',
    model: DEFAULT_MODELS.fast, // claude-4-haiku
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
    model: DEFAULT_MODELS.general, // claude-4-sonnet
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
    model: DEFAULT_MODELS.fast, // claude-4-haiku
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
    model: DEFAULT_MODELS.general, // claude-4-sonnet
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
    model: DEFAULT_MODELS.fast, // claude-4-haiku
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
