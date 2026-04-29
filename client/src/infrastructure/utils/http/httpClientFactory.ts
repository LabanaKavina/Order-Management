import { FetchHttpClient } from './FetchHttpClient';

/**
 * Creates a configured HTTP client instance based on environment
 */
export function createHttpClient(): FetchHttpClient {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  return new FetchHttpClient(baseUrl);
}
