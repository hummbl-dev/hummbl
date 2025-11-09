/**
 * HTTP Utilities
 * 
 * @module utils/http
 * @version 1.0.0
 * @description Utilities for HTTP requests with timeout support
 * 
 * HUMMBL Systems
 */

/**
 * Fetch with timeout
 * Prevents hanging requests to external APIs
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 60s)
 * @returns Promise that resolves to Response or rejects on timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 60000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Exponential backoff retry
 * Retries a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns Result of function or throws last error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * delay;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }
  
  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors (fetch failures) - TypeError or Error with TypeError name
  if (error instanceof TypeError) {
    return true;
  }
  
  if (error instanceof Error && error.name === 'TypeError') {
    return true;
  }
  
  // HTTP status codes that should be retried
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 || status === 429; // 5xx errors or rate limit
  }
  
  return false;
}
