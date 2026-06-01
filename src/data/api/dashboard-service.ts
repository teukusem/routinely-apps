import { apiClient } from './api-client';
import type { DashboardResponse } from '../../types/api';

// ─── Dashboard API ─────────────────────────────────────────────────────────────
export async function getDashboard(date: string): Promise<DashboardResponse> {
  const response = await apiClient.get('/dashboard', {
    params: { date },
  });
  return response.data.data;
}
