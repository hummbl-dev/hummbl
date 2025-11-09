/**
 * AI Service Layer
 * 
 * @module services/ai
 * @version 1.0.0
 * @description Integrations with AI providers (Claude, OpenAI)
 * 
 * HUMMBL Systems
 */

import { fetchWithTimeout } from '../utils/http';

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
 * IMPORTANT: This will fail in the browser due to CORS!
 * Anthropic API does not allow direct browser calls.
 * 
 * TODO: Move to Cloudflare Workers backend for production.
 */
const callClaude = async (
  provider: AIProvider,
  prompt: string,
  context?: Record<string, unknown>,
  temperature?: number,
  maxTokens?: number
): Promise<AIResponse> => {
  const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: context
            ? `Context: ${JSON.stringify(context, null, 2)}\n\n${prompt}`
            : prompt,
        },
      ],
    }),
  }, 60000);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model: provider.model,
    tokensUsed: data.usage?.total_tokens,
  };
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (
  provider: AIProvider,
  prompt: string,
  context?: Record<string, unknown>,
  temperature?: number,
  maxTokens?: number
): Promise<AIResponse> => {
  const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: context
            ? `Context: ${JSON.stringify(context, null, 2)}\n\n${prompt}`
            : prompt,
        },
      ],
    }),
  }, 60000);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model: provider.model,
    tokensUsed: data.usage?.total_tokens,
  };
};

/**
 * Get API key from environment or localStorage
 */
export const getAPIKey = (provider: 'anthropic' | 'openai'): string | undefined => {
  // Try environment variable first (for production)
  const envKey = provider === 'anthropic' 
    ? import.meta.env.VITE_ANTHROPIC_API_KEY 
    : import.meta.env.VITE_OPENAI_API_KEY;
  
  if (envKey) return envKey;

  // Fall back to localStorage (for local development)
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
