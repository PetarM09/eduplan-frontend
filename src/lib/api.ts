/**
 * Lagani HTTP klijent oko native fetch-a. Razumije Spring Boot {@code ApiResponse<T>}
 * wrapper (auto-unwrap data), JWT Bearer header, 401 → automatski refresh + retry,
 * binary download (Word/PDF/Excel).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return false;

  const data = await response.json().catch(() => null);
  if (data?.success && data.data?.accessToken) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return true;
  }
  return false;
}

function logoutAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sp.user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function doFetch(url: string, options: RequestOptions): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('accessToken');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.params);
  let response = await doFetch(url, options);

  // Auto-refresh na 401 ako imamo refresh token (osim na /auth/ rutama)
  if (response.status === 401 && localStorage.getItem('refreshToken') && !path.startsWith('/auth/')) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      response = await doFetch(url, options);
    } else {
      logoutAndRedirect();
    }
  }

  // Binary downloads (Word/PDF/Excel) — vrati blob direktno
  const contentType = response.headers.get('Content-Type') ?? '';
  if (
    response.ok &&
    (contentType.includes('application/pdf') ||
      contentType.includes('application/vnd.openxmlformats-officedocument') ||
      contentType.includes('application/octet-stream'))
  ) {
    return (await response.blob()) as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    if (!response.ok) throw new ApiError(response.status, 'Greska na serveru', 'SERVER_ERROR');
    return undefined as unknown as T;
  }

  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new ApiError(response.status, text, 'INVALID_JSON');
  }

  // Spring Boot ApiResponse<T> { success, data, error: { code, message } }
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (!payload.success) {
      throw new ApiError(
        response.status,
        payload.error?.message ?? 'Nepoznata greska',
        payload.error?.code ?? 'API_ERROR'
      );
    }
    return payload.data as T;
  }

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? 'Greska', payload?.code);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options: RequestOptions = {}) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
