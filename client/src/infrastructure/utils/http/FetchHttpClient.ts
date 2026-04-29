import type { IHttpClient } from './types';

interface ErrorResponse {
  error?: string;
  message?: string;
}

/**
 * HTTP client implementation using the Fetch API
 */
export class FetchHttpClient implements IHttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(method: string, url: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      let body: ErrorResponse = {};
      try { body = await response.json() as ErrorResponse; } catch { /* non-JSON body */ }
      throw new Error(body.error ?? body.message ?? `Request failed: ${response.status}`);
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  delete<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('DELETE', url, data);
  }

  patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }
}
