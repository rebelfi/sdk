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

        if (status === 401) {
          throw new RebelfiError('Invalid API key', 401, ErrorCode.INVALID_API_KEY);
        }

        if (status === 403) {
          throw new RebelfiError('API key revoked or disabled', 403, ErrorCode.API_KEY_DISABLED);
        }

        if (status === 429) {
          throw new RebelfiError('Rate limit exceeded', 429, ErrorCode.RATE_LIMIT_EXCEEDED);
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
