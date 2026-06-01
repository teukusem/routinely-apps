import { apiClient } from './api-client';
import type { ApiHabitLog, UpsertHabitLogInput } from '../../types/api';

// ─── Habit Logs API ────────────────────────────────────────────────────────────
export async function upsertLog(
  habitId: string,
  localDate: string,
  input: UpsertHabitLogInput,
): Promise<ApiHabitLog> {
  const response = await apiClient.put(
    `/habits/${habitId}/logs/${localDate}`,
    input,
  );
  return response.data.data;
}

export async function resetLog(
  habitId: string,
  localDate: string,
): Promise<void> {
  await apiClient.delete(`/habits/${habitId}/logs/${localDate}`);
}

export async function listLogs(
  habitId: string,
  from: string,
  to: string,
): Promise<ApiHabitLog[]> {
  const response = await apiClient.get(`/habits/${habitId}/logs`, {
    params: { from, to },
  });
  return response.data.data;
}
