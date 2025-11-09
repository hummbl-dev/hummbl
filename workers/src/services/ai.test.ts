import { afterEach, describe, expect, it, vi } from 'vitest';
import { callAI, createAIProvider } from './ai';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
  mockFetch.mockReset();
});

describe('createAIProvider', () => {
  it('returns an Anthropic provider when a Claude model is supplied', () => {
    const result = createAIProvider(
      'claude-4-haiku',
      { anthropic: 'user-key', openai: undefined },
      { anthropic: 'env-key', openai: 'env-openai' }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        name: 'anthropic',
        model: 'claude-4-haiku',
        apiKey: 'user-key',
      });
    }
  });

  it('falls back to environment keys when user keys are missing', () => {
    const result = createAIProvider(
      'gpt-4o-mini',
      {},
      { anthropic: 'env-claude', openai: 'env-openai' }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        name: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'env-openai',
      });
    }
  });

  it('fails when the model prefix is unknown', () => {
    const result = createAIProvider(
      'unknown-model',
      {},
      { anthropic: 'env-claude', openai: 'env-openai' }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Unknown model');
    }
  });
});

describe('callAI', () => {
  it('returns parsed content for Anthropic models', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ text: 'Anthropic response' }],
          usage: { total_tokens: 42 },
        }),
        { status: 200 }
      )
    );

    const result = await callAI(
      { name: 'anthropic', model: 'claude-4-haiku', apiKey: 'key' },
      'Prompt text'
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        content: 'Anthropic response',
        provider: 'anthropic',
        model: 'claude-4-haiku',
        tokensUsed: 42,
      });
    }
  });

  it('propagates API errors for OpenAI models', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Bad Request', { status: 400 })
    );

    const result = await callAI(
      { name: 'openai', model: 'gpt-4o', apiKey: 'key' },
      'Prompt text'
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/OpenAI API error/);
    }
  });
});


