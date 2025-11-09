/**
 * HUMMBL AI Service - Server-Side
 * NO CORS issues - runs on Cloudflare Workers edge
 * Integrates with Anthropic Claude and OpenAI GPT
 * Using P1 (Perspective): Frame AI as tool, not oracle
 */

import type { AIProvider, AIResponse, Result } from '../types';
import { fetchWithTimeout } from '../lib/http';

/**
 * Call AI API (server-side, CORS-free)
 * Automatically routes to correct provider based on model
 */
export async function callAI(
  provider: AIProvider,
  prompt: string,
  context?: Record<string, unknown>,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<Result<AIResponse>> {
  try {
    // Route to correct provider based on model name
    if (provider.model.startsWith('claude')) {
      return await callClaude(provider, prompt, context, temperature, maxTokens);
    } else if (provider.model.startsWith('gpt')) {
      return await callOpenAI(provider, prompt, context, temperature, maxTokens);
    } else {
      return {
        ok: false,
        error: `Unknown model: ${provider.model}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown AI error',
    };
  }
}

/**
 * Call Anthropic Claude API
 * No CORS issues when running server-side!
 */
async function callClaude(
  provider: AIProvider,
  prompt: string,
  context?: Record<string, unknown>,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<Result<AIResponse>> {
  try {
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
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
      const errorText = await response.text();
      return {
        ok: false,
        error: `Claude API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json() as {
      content: Array<{ text: string }>;
      usage?: { total_tokens: number };
    };

    return {
      ok: true,
      value: {
        content: data.content[0].text,
        provider: 'anthropic',
        model: provider.model,
        tokensUsed: data.usage?.total_tokens,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: `Claude call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Call OpenAI GPT API
 * No CORS issues when running server-side!
 */
async function callOpenAI(
  provider: AIProvider,
  prompt: string,
  context?: Record<string, unknown>,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<Result<AIResponse>> {
  try {
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
            role: 'system',
            content: 'You are a helpful AI assistant executing workflow tasks.',
          },
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
      const errorText = await response.text();
      return {
        ok: false,
        error: `OpenAI API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };

    return {
      ok: true,
      value: {
        content: data.choices[0].message.content,
        provider: 'openai',
        model: provider.model,
        tokensUsed: data.usage?.total_tokens,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: `OpenAI call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create AI provider from agent and API keys
 */
export function createAIProvider(
  model: string,
  apiKeys: { anthropic?: string; openai?: string },
  envKeys: { anthropic: string; openai: string }
): Result<AIProvider> {
  // Determine provider from model name
  const isAnthropic = model.startsWith('claude');
  const isOpenAI = model.startsWith('gpt');

  if (!isAnthropic && !isOpenAI) {
    return {
      ok: false,
      error: `Unknown model: ${model}. Must start with 'claude' or 'gpt'`,
    };
  }

  // Get API key (prefer user-provided, fallback to env)
  const apiKey = isAnthropic
    ? (apiKeys.anthropic || envKeys.anthropic)
    : (apiKeys.openai || envKeys.openai);

  if (!apiKey) {
    return {
      ok: false,
      error: `No API key for ${isAnthropic ? 'Anthropic' : 'OpenAI'}`,
    };
  }

  return {
    ok: true,
    value: {
      name: isAnthropic ? 'anthropic' : 'openai',
      apiKey,
      model,
    },
  };
}
