import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as moodLogsService from '../api/mood-logs-service';
import { dashboardKeys } from './use-dashboard';
import type { UpsertMoodLogInput } from '../../types/api';

export const moodLogKeys = {
  all: ['moodLogs'] as const,
  byDate: (date: string) => [...moodLogKeys.all, date] as const,
  list: (from: string, to: string) => [...moodLogKeys.all, 'list', from, to] as const,
};

export function useMoodLog(localDate: string) {
  return useQuery({
    queryKey: moodLogKeys.byDate(localDate),
    queryFn: () => moodLogsService.getMoodLog(localDate),
  });
}

export function useMoodLogs(from: string, to: string) {
  return useQuery({
    queryKey: moodLogKeys.list(from, to),
    queryFn: () => moodLogsService.listMoodLogs(from, to),
    enabled: !!from && !!to,
  });
}

export function useUpsertMoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      localDate,
      input,
    }: {
      localDate: string;
      input: UpsertMoodLogInput;
    }) => moodLogsService.upsertMoodLog(localDate, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodLogKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
