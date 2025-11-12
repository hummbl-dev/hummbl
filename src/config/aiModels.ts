/**
 * AI Model Catalog
 * 
 * @module config/aiModels
 * @version 1.0.0
 * @description Comprehensive catalog of available AI models from all providers
 * 
 * Users can access any model their API key supports.
 * Easy to extend as new models are released.
 * 
 * HUMMBL Systems
 */

export type AIProvider = 'anthropic' | 'openai' | 'xai';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  family: string;
  description: string;
  contextWindow: number;
  inputCost: number;  // Cost per 1M tokens
  outputCost: number; // Cost per 1M tokens
  speed: 'very-fast' | 'fast' | 'medium' | 'slow';
  capabilities: string[];
  released: string; // YYYY-MM format
  recommended?: boolean;
}

/**
 * Claude Models (Anthropic)
 * Updated: November 2024
 */
export const CLAUDE_MODELS: AIModel[] = [
  // Claude 4.x Family (Latest)
  {
    id: 'claude-4-opus',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    family: 'Claude 4',
    description: 'Most powerful Claude model with highest intelligence',
    contextWindow: 200000,
    inputCost: 15,
    outputCost: 75,
    speed: 'slow',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing', 'vision'],
    released: '2024-11',
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    family: 'Claude 4',
    description: 'Best balanced performance for most tasks',
    contextWindow: 200000,
    inputCost: 3,
    outputCost: 15,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-11',
    recommended: true,
  },
  {
    id: 'claude-4-haiku',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    family: 'Claude 4',
    description: 'Fastest Claude 4 model, excellent for real-time applications',
    contextWindow: 200000,
    inputCost: 0.25,
    outputCost: 1.25,
    speed: 'very-fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-11',
    recommended: true,
  },

  // Claude 3.7 (Updated 3.5)
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude Sonnet 3.7',
    provider: 'anthropic',
    family: 'Claude 3.7',
    description: 'Updated Claude 3.5 with improved performance',
    contextWindow: 200000,
    inputCost: 3,
    outputCost: 15,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-10',
  },

  // Claude 3.5 Family
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude Sonnet 3.5 (Oct 2024)',
    provider: 'anthropic',
    family: 'Claude 3.5',
    description: 'Industry-leading coding and reasoning',
    contextWindow: 200000,
    inputCost: 3,
    outputCost: 15,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing', 'vision'],
    released: '2024-10',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude Haiku 3.5',
    provider: 'anthropic',
    family: 'Claude 3.5',
    description: 'Fast and intelligent, same quality as Opus 3',
    contextWindow: 200000,
    inputCost: 0.25,
    outputCost: 1.25,
    speed: 'very-fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-11',
  },

  // Claude 3 Family (Original)
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude Opus 3',
    provider: 'anthropic',
    family: 'Claude 3',
    description: 'Highest quality Claude 3 model',
    contextWindow: 200000,
    inputCost: 15,
    outputCost: 75,
    speed: 'slow',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing', 'vision'],
    released: '2024-03',
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude Sonnet 3',
    provider: 'anthropic',
    family: 'Claude 3',
    description: 'Balanced Claude 3 model',
    contextWindow: 200000,
    inputCost: 3,
    outputCost: 15,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing', 'vision'],
    released: '2024-03',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude Haiku 3',
    provider: 'anthropic',
    family: 'Claude 3',
    description: 'Fast and cost-effective',
    contextWindow: 200000,
    inputCost: 0.25,
    outputCost: 1.25,
    speed: 'very-fast',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-03',
  },
];

/**
 * OpenAI Models
 * Updated: November 2024
 */
export const OPENAI_MODELS: AIModel[] = [
  // o1 Series (Reasoning Models)
  {
    id: 'o1',
    name: 'GPT-o1',
    provider: 'openai',
    family: 'o1',
    description: 'Most advanced reasoning model, best for complex problems',
    contextWindow: 128000,
    inputCost: 15,
    outputCost: 60,
    speed: 'slow',
    capabilities: ['advanced-reasoning', 'math', 'science', 'coding'],
    released: '2024-12',
    recommended: true,
  },
  {
    id: 'o1-preview',
    name: 'GPT-o1 Preview',
    provider: 'openai',
    family: 'o1',
    description: 'Preview of advanced reasoning capabilities',
    contextWindow: 128000,
    inputCost: 15,
    outputCost: 60,
    speed: 'slow',
    capabilities: ['advanced-reasoning', 'math', 'science', 'coding'],
    released: '2024-09',
  },
  {
    id: 'o1-mini',
    name: 'GPT-o1 Mini',
    provider: 'openai',
    family: 'o1',
    description: 'Faster reasoning model, 80% cheaper',
    contextWindow: 128000,
    inputCost: 3,
    outputCost: 12,
    speed: 'medium',
    capabilities: ['reasoning', 'math', 'coding'],
    released: '2024-09',
  },

  // GPT-4o Series (Omni Models)
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    family: 'GPT-4o',
    description: 'Fastest GPT-4 class model with vision',
    contextWindow: 128000,
    inputCost: 2.5,
    outputCost: 10,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'vision', 'audio', 'analysis'],
    released: '2024-05',
    recommended: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    family: 'GPT-4o',
    description: 'Most affordable smart model',
    contextWindow: 128000,
    inputCost: 0.15,
    outputCost: 0.6,
    speed: 'very-fast',
    capabilities: ['reasoning', 'coding', 'vision', 'analysis'],
    released: '2024-07',
    recommended: true,
  },
  {
    id: 'gpt-4o-audio-preview',
    name: 'GPT-4o Audio Preview',
    provider: 'openai',
    family: 'GPT-4o',
    description: 'Audio input and output capabilities',
    contextWindow: 128000,
    inputCost: 2.5,
    outputCost: 10,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'vision', 'audio', 'analysis'],
    released: '2024-10',
  },

  // GPT-4 Turbo
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    family: 'GPT-4',
    description: 'Latest GPT-4 with vision',
    contextWindow: 128000,
    inputCost: 10,
    outputCost: 30,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'vision', 'analysis'],
    released: '2024-04',
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo Preview',
    provider: 'openai',
    family: 'GPT-4',
    description: 'Preview of GPT-4 Turbo',
    contextWindow: 128000,
    inputCost: 10,
    outputCost: 30,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis'],
    released: '2023-11',
  },

  // GPT-4 (Original)
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    family: 'GPT-4',
    description: 'Original GPT-4',
    contextWindow: 8192,
    inputCost: 30,
    outputCost: 60,
    speed: 'slow',
    capabilities: ['reasoning', 'coding', 'analysis'],
    released: '2023-03',
  },

  // GPT-3.5 Turbo
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    family: 'GPT-3.5',
    description: 'Fast and affordable for simple tasks',
    contextWindow: 16385,
    inputCost: 0.5,
    outputCost: 1.5,
    speed: 'very-fast',
    capabilities: ['reasoning', 'coding', 'analysis'],
    released: '2023-03',
  },
];

/**
 * Grok Models (xAI)
 * Updated: November 2024
 */
export const GROK_MODELS: AIModel[] = [
  {
    id: 'grok-1',
    name: 'Grok-1',
    provider: 'xai',
    family: 'Grok',
    description: 'xAI\'s flagship model with advanced reasoning',
    contextWindow: 128000,
    inputCost: 0, // Free for now, update when pricing available
    outputCost: 0,
    speed: 'medium',
    capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
    released: '2024-03',
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    family: 'Grok',
    description: 'Beta version of Grok with improved performance',
    contextWindow: 128000,
    inputCost: 0,
    outputCost: 0,
    speed: 'fast',
    capabilities: ['reasoning', 'coding', 'analysis'],
    released: '2024-11',
    recommended: true,
  },
];

/**
 * Get all models for a provider
 */
export const getModelsByProvider = (provider: AIProvider): AIModel[] => {
  return provider === 'anthropic' ? CLAUDE_MODELS : provider === 'openai' ? OPENAI_MODELS : GROK_MODELS;
};

/**
 * Get all models
 */
export const getAllModels = (): AIModel[] => {
  return [...CLAUDE_MODELS, ...OPENAI_MODELS, ...GROK_MODELS];
};

/**
 * Get recommended models
 */
export const getRecommendedModels = (): AIModel[] => {
  return getAllModels().filter(m => m.recommended);
};

/**
 * Get model by ID
 */
export const getModelById = (id: string): AIModel | undefined => {
  return getAllModels().find(m => m.id === id);
};

/**
 * Get models by family
 */
export const getModelsByFamily = (family: string): AIModel[] => {
  return getAllModels().filter(m => m.family === family);
};

/**
 * Get models by speed
 */
export const getModelsBySpeed = (speed: AIModel['speed']): AIModel[] => {
  return getAllModels().filter(m => m.speed === speed);
};

/**
 * Get budget-friendly models (< $1 per 1M tokens)
 */
export const getBudgetModels = (): AIModel[] => {
  return getAllModels().filter(m => m.inputCost < 1);
};

/**
 * Default model recommendations
 */
export const DEFAULT_MODELS = {
  // Best overall (balanced)
  general: 'claude-4-sonnet',
  
  // Speed priority
  fast: 'claude-4-haiku',
  
  // Quality priority
  quality: 'claude-4-opus',
  
  // Budget priority
  budget: 'gpt-4o-mini',
  
  // Reasoning priority
  reasoning: 'o1',
};
