import { apiClient } from './api-client';
import type { WeeklyAnalyticsResponse } from '../../types/api';

// ─── Analytics API ─────────────────────────────────────────────────────────────
export async function getWeeklyAnalytics(
  anchorDate: string,
): Promise<WeeklyAnalyticsResponse> {
  const response = await apiClient.get('/analytics/weekly', {
    params: { anchorDate },
  });
  return response.data.data;
}
