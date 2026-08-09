import { withRetry } from '../retry';

export async function executeHttpRequestStep(
  config: { url: string; method?: string; headers?: Record<string, string>; body?: any },
  inputPayload: any
) {
  return await withRetry(async (attempt) => {
    const url = config.url || 'https://httpbin.org/post';
    const method = config.method || 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {}),
        },
        body: method !== 'GET' ? JSON.stringify({ ...inputPayload, ...(config.body || {}) }) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = { text: await response.text() };
      }

      return {
        status: response.status,
        statusText: response.statusText,
        data,
        attempt,
      };
    } catch (error: any) {
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  });
}
