import { useQuery } from '@tanstack/react-query';
import * as analyticsService from '../api/analytics-service';

export const analyticsKeys = {
  all: ['analytics'] as const,
  weekly: (anchorDate: string) => [...analyticsKeys.all, 'weekly', anchorDate] as const,
};

export function useWeeklyAnalytics(anchorDate: string) {
  return useQuery({
    queryKey: analyticsKeys.weekly(anchorDate),
    queryFn: () => analyticsService.getWeeklyAnalytics(anchorDate),
  });
}
