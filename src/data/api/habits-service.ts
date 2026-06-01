import { apiClient } from './api-client';
import type { ApiHabit, CreateHabitInput, UpdateHabitInput } from '../../types/api';

// ─── Habits API ────────────────────────────────────────────────────────────────
export async function createHabit(input: CreateHabitInput): Promise<ApiHabit> {
  const response = await apiClient.post('/habits', input);
  return response.data.data;
}

export async function listHabits(
  lifecycle?: string,
  category?: string,
): Promise<ApiHabit[]> {
  const params: Record<string, string> = {};
  if (lifecycle) params.lifecycle = lifecycle;
  if (category) params.category = category;

  const response = await apiClient.get('/habits', { params });
  return response.data.data;
}

export async function getHabit(id: string): Promise<ApiHabit> {
  const response = await apiClient.get(`/habits/${id}`);
  return response.data.data;
}

export async function updateHabit(
  id: string,
  input: UpdateHabitInput,
): Promise<ApiHabit> {
  const response = await apiClient.patch(`/habits/${id}`, input);
  return response.data.data;
}

export async function archiveHabit(id: string): Promise<ApiHabit> {
  const response = await apiClient.post(`/habits/${id}/archive`);
  return response.data.data;
}

export async function restoreHabit(id: string): Promise<ApiHabit> {
  const response = await apiClient.post(`/habits/${id}/restore`);
  return response.data.data;
}
