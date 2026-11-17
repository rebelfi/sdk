import axios, { AxiosInstance, AxiosError } from 'axios';
import { RebelfiSDKConfig, RebelfiError, ErrorCode } from './types.js';

const PRODUCTION_BASE_URL = 'https://api.rebelfi.io';
const SANDBOX_BASE_URL = 'https://sandbox-api.rebelfi.io';
// 60 second default timeout - blockchain operations can take time
const DEFAULT_TIMEOUT = 60000;

export function createHttpClient(config: RebelfiSDKConfig): AxiosInstance {
  // Determine base URL: explicit override > sandbox flag > production default
  const baseURL = config.baseUrl || (config.sandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL);

  const client = axios.create({
    baseURL,
    timeout: config.timeout || DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    },
    // Accept 2xx status codes (including 201 Created and 202 Accepted)
    validateStatus: (status) => status >= 200 && status < 300
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; code?: string; details?: Record<string, unknown> }>) => {
      if (error.response) {
        const { status, data } = error.response;

        // Prefer the server's code when it sends one. The hardcoded codes are only the
        // fallback for responses that have none (older backends, and a disabled key).
        if (status === 401) {
          throw new RebelfiError(
            data?.message || 'Invalid API key',
            401,
            data?.code || ErrorCode.INVALID_API_KEY,
            data?.details
          );
        }

        if (status === 403) {
          throw new RebelfiError(
            data?.message || 'API key revoked or disabled',
            403,
            data?.code || ErrorCode.API_KEY_DISABLED,
            data?.details
          );
        }

        if (status === 429) {
          throw new RebelfiError(
            data?.message || 'Rate limit exceeded',
            429,
            data?.code || ErrorCode.RATE_LIMIT_EXCEEDED,
            data?.details
          );
        }

        // Use error code from response if available
        throw new RebelfiError(
          data?.message || 'Request failed',
          status,
          data?.code || ErrorCode.UNKNOWN_ERROR,
          data?.details
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new RebelfiError('Request timeout', 408, ErrorCode.TIMEOUT);
      }

      throw new RebelfiError('Network error', 0, ErrorCode.NETWORK_ERROR);
    }
  );

  return client;
}

/**
 * Extract data from axios response.
 * The API returns data directly (no envelope wrapper).
 */
export function unwrapResponse<T>(response: { data: T }): T {
  return response.data;
}

/**
 * API version prefix. All endpoints are under /v1.
 */
export function getVersionPrefix(_config: RebelfiSDKConfig): string {
  return '/v1';
}
