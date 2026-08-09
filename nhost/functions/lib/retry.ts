// Shared retry-on-failure helper with exponential backoff
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<{ result?: T; attempts: number; error?: string }> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const result = await fn(attempt);
      return { result, attempts: attempt };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoff = delayMs * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, backoff));
      }
    }
  }

  return {
    attempts: attempt,
    error: lastError ? lastError.message : 'Unknown execution failure',
  };
}
