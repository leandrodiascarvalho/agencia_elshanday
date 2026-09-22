/**
 * Centralized API Client (Clean Architecture / Service Layer)
 * Manages HTTP communication, headers, timeouts, and JSON parsing.
 */

const DEFAULT_TIMEOUT_MS = 8000;

export class ApiClient {
  /**
   * Executes an HTTP request with timeout protection.
   * @param {string} endpoint
   * @param {RequestInit} [options={}]
   * @returns {Promise<any>}
   */
  static async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = options.timeout || DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), timeout);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          errorBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new Error('A requisição excedeu o tempo limite.', { cause: error });
      }
      throw error;
    }
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
