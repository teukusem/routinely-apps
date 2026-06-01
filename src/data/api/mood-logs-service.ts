import { apiClient } from './api-client';
import type { ApiMoodLog, UpsertMoodLogInput } from '../../types/api';

// ─── Mood Logs API ─────────────────────────────────────────────────────────────
export async function upsertMoodLog(
  localDate: string,
  input: UpsertMoodLogInput,
): Promise<ApiMoodLog> {
  const response = await apiClient.put(`/mood-logs/${localDate}`, input);
  return response.data.data;
}

export async function getMoodLog(localDate: string): Promise<ApiMoodLog | null> {
  try {
    const response = await apiClient.get(`/mood-logs/${localDate}`);
    return response.data.data;
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw error;
  }
}

export async function listMoodLogs(
  from: string,
  to: string,
): Promise<ApiMoodLog[]> {
  const response = await apiClient.get('/mood-logs', {
    params: { from, to },
  });
  return response.data.data;
}

export async function deleteMoodLog(localDate: string): Promise<void> {
  await apiClient.delete(`/mood-logs/${localDate}`);
}
