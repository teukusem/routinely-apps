import { apiClient } from './api-client';
import type { ApiHabit, CreateHabitInput, UpdateHabitInput } from '../../types/api';

// ─── Response shape ────────────────────────────────────────────────────────────
export type PaginatedHabitsResponse = {
  data: ApiHabit[];
  meta: { nextCursor: string | null };
};

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

export async function listHabitsPaginated(params?: {
  lifecycle?: string;
  category?: string;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedHabitsResponse> {
  const query: Record<string, string | number> = {};
  if (params?.lifecycle) query.lifecycle = params.lifecycle;
  if (params?.category) query.category = params.category;
  if (params?.cursor) query.cursor = params.cursor;
  if (params?.limit) query.limit = params.limit;

  const response = await apiClient.get('/habits', { params: query });

  // Handle both paginated and non-paginated backend responses gracefully
  const body = response.data;
  if (body.meta?.nextCursor !== undefined) {
    return { data: body.data, meta: body.meta };
  }
  // Fallback: backend returns flat array without pagination meta
  const data = Array.isArray(body.data) ? body.data : body;
  return { data, meta: { nextCursor: null } };
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
