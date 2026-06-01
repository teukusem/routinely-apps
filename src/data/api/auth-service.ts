import { apiClient } from './api-client';
import { setTokens, clearTokens, getRefreshToken } from './token-store';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  timezone: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

// ─── Auth API ──────────────────────────────────────────────────────────────────
export async function register(input: {
  email: string;
  password: string;
  name?: string;
  timezone: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/register', input);
  const auth: AuthResponse = response.data.data;
  await setTokens(auth.accessToken, auth.refreshToken);
  return auth;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', input);
  const auth: AuthResponse = response.data.data;
  await setTokens(auth.accessToken, auth.refreshToken);
  return auth;
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  } finally {
    await clearTokens();
  }
}

export async function getSession(): Promise<{ userId: string }> {
  const response = await apiClient.get('/auth/session');
  return response.data.data;
}
