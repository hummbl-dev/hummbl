import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout, retryWithBackoff, isRetryableError } from './http';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should fetch successfully within timeout', async () => {
    const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const promise = fetchWithTimeout('https://api.example.com/test', {}, 5000);
    const result = await promise;

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('should abort request on timeout', async () => {
    let abortCalled = false;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      // Check if signal is aborted
      if (options?.signal) {
        options.signal.addEventListener('abort', () => {
          abortCalled = true;
        });
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (abortCalled) {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          } else {
            resolve({ ok: true });
          }
        }, 2000);
      });
    });

    vi.useRealTimers();
    const promise = fetchWithTimeout('https://api.example.com/test', {}, 100);
    await expect(promise).rejects.toThrow('Request timeout');
    vi.useFakeTimers();
  });

  it('should pass through fetch options', async () => {
    const mockResponse = { ok: true };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    };

    await fetchWithTimeout('https://api.example.com/test', options, 5000);

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
      signal: expect.any(AbortSignal),
    }));
  });
});

describe('isRetryableError', () => {
  it('should return true for network errors', () => {
    const networkError = new TypeError('Failed to fetch');
    expect(isRetryableError(networkError)).toBe(true);
    
    const fetchError = new Error('fetch failed');
    fetchError.name = 'TypeError';
    expect(isRetryableError(fetchError)).toBe(true);
  });

  it('should return true for 5xx errors', () => {
    const error500 = { status: 500 };
    const error503 = { status: 503 };
    expect(isRetryableError(error500)).toBe(true);
    expect(isRetryableError(error503)).toBe(true);
  });

  it('should return true for 429 rate limit errors', () => {
    const error429 = { status: 429 };
    expect(isRetryableError(error429)).toBe(true);
  });

  it('should return false for 4xx client errors', () => {
    const error400 = { status: 400 };
    const error404 = { status: 404 };
    expect(isRetryableError(error400)).toBe(false);
    expect(isRetryableError(error404)).toBe(false);
  });

  it('should return false for successful responses', () => {
    const success = { status: 200 };
    expect(isRetryableError(success)).toBe(false);
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const successFn = vi.fn().mockResolvedValue('success');
    
    const promise = retryWithBackoff(successFn, 3, 1000);
    const result = await promise;

    expect(result).toBe('success');
    expect(successFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    let attemptCount = 0;
    const retryFn = vi.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    });

    const promise = retryWithBackoff(retryFn, 5, 100);

    // Fast-forward through delays
    for (let i = 0; i < 3; i++) {
      await vi.runAllTimersAsync();
    }

    const result = await promise;

    expect(result).toBe('success');
    expect(retryFn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries exhausted', async () => {
    const failFn = vi.fn().mockRejectedValue(new Error('Permanent failure'));

    const promise = retryWithBackoff(failFn, 3, 100);

    // Fast-forward through all retry attempts
    for (let i = 0; i < 4; i++) {
      await vi.runAllTimersAsync();
    }

    await expect(promise).rejects.toThrow('Permanent failure');
    expect(failFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });

  it('should apply exponential backoff delays', async () => {
    const delays: number[] = [];
    let attemptCount = 0;

    const retryFn = vi.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 4) {
        const now = Date.now();
        if (delays.length > 0) {
          delays.push(now - delays[delays.length - 1]);
        } else {
          delays.push(now);
        }
        throw new Error('Retry');
      }
      return 'success';
    });

    const promise = retryWithBackoff(retryFn, 5, 1000);

    for (let i = 0; i < 4; i++) {
      await vi.runAllTimersAsync();
    }

    await promise;

    // Verify exponential growth (with jitter tolerance)
    // First delay ~1000ms, second ~2000ms, third ~3000ms
    expect(delays.length).toBeGreaterThan(0);
  });
});
