import { apiClient } from './api-client';
import type {
  ApiUserProfile,
  UpdateProfileInput,
  UpdateEmailInput,
  UpdatePasswordInput,
} from '../../types/api';

// ─── User / Profile API ───────────────────────────────────────────────────────
export async function getProfile(): Promise<ApiUserProfile> {
  const response = await apiClient.get('/me');
  return response.data.data;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ApiUserProfile> {
  const response = await apiClient.patch('/me', input);
  return response.data.data;
}

export async function updateEmail(
  input: UpdateEmailInput,
): Promise<ApiUserProfile> {
  const response = await apiClient.patch('/me/email', input);
  return response.data.data;
}

export async function updatePassword(input: UpdatePasswordInput): Promise<void> {
  await apiClient.patch('/me/password', input);
}

export async function requestDeletion(currentPassword: string): Promise<void> {
  await apiClient.post('/me/delete-request', { currentPassword });
}

export async function cancelDeletion(): Promise<void> {
  await apiClient.post('/me/delete-request/cancel');
}

export async function updateNotificationSettings(input: {
  notificationsEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}): Promise<ApiUserProfile> {
  const response = await apiClient.patch('/me/notification-settings', input);
  return response.data.data;
}
