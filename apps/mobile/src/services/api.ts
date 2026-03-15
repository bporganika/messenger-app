import { env } from '../config/env';
import { secureStorage } from './secureStorage';

// ─── HTTPS enforcement ───────────────────────────────────

function assertHttps(url: string): void {
  if (!url.startsWith('https://')) {
    throw new Error(`Insecure URL rejected. All API calls must use HTTPS: ${url}`);
  }
}

// ─── Token refresh ───────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processRefreshQueue(token: string | null, error: Error | null): void {
  for (const { resolve, reject } of refreshQueue) {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  }
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = await secureStorage.getTokens();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const url = `${env.apiBaseUrl}/auth/refresh`;
  assertHttps(url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  await secureStorage.setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

async function getValidAccessToken(): Promise<string | null> {
  const { accessToken } = await secureStorage.getTokens();
  return accessToken;
}

// ─── API Client ──────────────────────────────────────────

interface RequestOptions {
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string>;
}

async function request<T = unknown>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = env.apiBaseUrl;
  assertHttps(baseUrl);

  let url = `${baseUrl}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams.toString()}`;
  }

  const accessToken = await getValidAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    method,
    headers,
    body: options.data ? JSON.stringify(options.data) : undefined,
  });

  // Auto-refresh on 401
  if (response.status === 401 && accessToken) {
    if (isRefreshing) {
      const newToken = await new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
      });
    } else {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processRefreshQueue(newToken, null);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          method,
          headers,
          body: options.data ? JSON.stringify(options.data) : undefined,
        });
      } catch (err) {
        processRefreshQueue(null, err as Error);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function uploadFormData<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;
  assertHttps(url);

  const accessToken = await getValidAccessToken();
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Upload error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),

  post: <T = unknown>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, data }),

  patch: <T = unknown>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, data }),

  put: <T = unknown>(path: string, data?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, data }),

  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, options),

  upload: <T = unknown>(path: string, formData: FormData) =>
    uploadFormData<T>(path, formData),
};
