import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token-store';

const BASE_URL = 'https://api-production-9245.up.railway.app/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request interceptor: attach access token ─────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Deduplicate concurrent refresh attempts
        if (!refreshPromise) {
          refreshPromise = attemptTokenRefresh();
        }

        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        refreshPromise = null;
        await clearTokens();
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

// ─── Token refresh ─────────────────────────────────────────────────────────────
async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    await setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

// ─── Error normalization ───────────────────────────────────────────────────────
export type ApiErrorShape = {
  code: string;
  message: string;
  details?: { field: string; reason: string }[];
  status: number;
};

function normalizeApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error) && error.response) {
    const body = error.response.data;
    if (body?.error) {
      return {
        code: body.error.code ?? 'UNKNOWN_ERROR',
        message: body.error.message ?? 'An error occurred',
        details: body.error.details,
        status: error.response.status,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: error.response.statusText ?? 'An error occurred',
      status: error.response.status,
    };
  }

  return {
    code: 'NETWORK_ERROR',
    message: 'Unable to connect to the server. Please check your connection.',
    status: 0,
  };
}
