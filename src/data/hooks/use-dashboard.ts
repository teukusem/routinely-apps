import { useQuery } from '@tanstack/react-query';
import * as dashboardService from '../api/dashboard-service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  byDate: (date: string) => [...dashboardKeys.all, date] as const,
};

export function useDashboard(date: string) {
  return useQuery({
    queryKey: dashboardKeys.byDate(date),
    queryFn: () => dashboardService.getDashboard(date),
  });
}
