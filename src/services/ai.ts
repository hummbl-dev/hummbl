/**
 * AI Service Layer
 * 
 * @module services/ai
 * @version 2.0.0 - SECURITY UPDATE
 * @description API key management for AI providers
 * 
 * [!] SECURITY NOTICE:
 * Direct AI API calls from frontend have been disabled.
 * All AI execution must go through backend proxy for security.
 * Use executeWorkflow() from services/api.ts instead.
 * 
 * HUMMBL Systems
 */

export interface AIProvider {
  name: string;
  model: string;
  apiKey?: string;
}

export interface AIRequest {
  prompt: string;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

/**
 * Call AI provider with request
 */
export const callAI = async (
  provider: AIProvider,
  request: AIRequest
): Promise<AIResponse> => {
  const { prompt, context, temperature = 0.7, maxTokens = 2000 } = request;

  // Check for API key
  if (!provider.apiKey) {
    return {
      content: '',
      provider: provider.name,
      model: provider.model,
      error: 'API key not configured. Please set your API key in environment variables.',
    };
  }

  try {
    // Determine which provider to use
    if (provider.model.includes('claude')) {
      return await callClaude(provider, prompt, context, temperature, maxTokens);
    } else if (provider.model.includes('gpt')) {
      return await callOpenAI(provider, prompt, context, temperature, maxTokens);
    } else {
      return {
        content: '',
        provider: provider.name,
        model: provider.model,
        error: `Unsupported model: ${provider.model}`,
      };
    }
  } catch (error) {
    return {
      content: '',
      provider: provider.name,
      model: provider.model,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Call Claude (Anthropic) API
 * 
 * ⚠️ DEPRECATED: Direct browser calls are disabled for security.
 * ⚠️ Use the backend API proxy instead: POST /api/workflows/:id/execute
 * 
 * SECURITY: API keys should never be exposed in the browser.
 * Anthropic API does not allow direct browser calls (CORS blocked).
 * All AI calls must go through Cloudflare Workers backend.
 */
const callClaude = async (
  _provider: AIProvider,
  _prompt: string,
  _context?: Record<string, unknown>,
  _temperature?: number,
  _maxTokens?: number
): Promise<AIResponse> => {
  throw new Error(
    'Direct AI calls from frontend are disabled for security. ' +
    'Use executeWorkflow() from services/api.ts instead, which routes through backend proxy.'
  );
};

/**
 * Call OpenAI API
 * 
 * [!] DEPRECATED: Direct browser calls are disabled for security.
 * [!] Use the backend API proxy instead: POST /api/workflows/:id/execute
 * 
 * SECURITY: API keys should never be exposed in the browser.
 * All AI calls must go through Cloudflare Workers backend.
 */
const callOpenAI = async (
  _provider: AIProvider,
  _prompt: string,
  _context?: Record<string, unknown>,
  _temperature?: number,
  _maxTokens?: number
): Promise<AIResponse> => {
  throw new Error(
    'Direct AI calls from frontend are disabled for security. ' +
    'Use executeWorkflow() from services/api.ts instead, which routes through backend proxy.'
  );
};

/**
 * Get API key from localStorage
 * 
 * /**
 * [!] SECURITY: Environment variables are NOT used for API keys in production.
 * Keys stored here are only for Settings page display and backend submission.
 * Never expose API keys in frontend environment variables or source code.
 */
export const getAPIKey = (provider: 'anthropic' | 'openai'): string | undefined => {
  // WARNING: Do NOT use environment variables for API keys
  // They would be exposed in the browser bundle
  if (import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_OPENAI_API_KEY) {
      '[!] SECURITY WARNING: API keys detected in environment variables! ' +
      '⚠️ SECURITY WARNING: API keys detected in environment variables! ' +
      'Remove VITE_ANTHROPIC_API_KEY and VITE_OPENAI_API_KEY from .env files. ' +
      'API keys should only be stored in backend secrets.'
    );
  }

  // Get from localStorage (submitted to backend for workflow execution)
  const storageKey = provider === 'anthropic' ? 'anthropic_api_key' : 'openai_api_key';
  return localStorage.getItem(storageKey) || undefined;
};

/**
 * Set API key in localStorage
 */
export const setAPIKey = (provider: 'anthropic' | 'openai', key: string): void => {
  const storageKey = provider === 'anthropic' ? 'anthropic_api_key' : 'openai_api_key';
  localStorage.setItem(storageKey, key);
};

/**
 * Create AI provider from agent configuration
 */
export const createProvider = (model: string): AIProvider => {
  const provider = model.includes('claude') ? 'anthropic' : 'openai';
  const apiKey = getAPIKey(provider);
  
  return {
    name: provider,
    model,
    apiKey,
  };
};
