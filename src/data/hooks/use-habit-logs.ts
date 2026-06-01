import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as habitLogsService from '../api/habit-logs-service';
import { dashboardKeys } from './use-dashboard';
import { habitKeys } from './use-habits';
import type { UpsertHabitLogInput } from '../../types/api';

function generateMutationId(): string {
  // Simple UUID v4 generation without external dependency
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useUpsertHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      habitId,
      localDate,
      status,
      value,
    }: {
      habitId: string;
      localDate: string;
      status: 'in_progress' | 'completed' | 'skipped';
      value?: number;
    }) => {
      const input: UpsertHabitLogInput = {
        mutationId: generateMutationId(),
        status,
        value,
      };
      return habitLogsService.upsertLog(habitId, localDate, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useResetHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      habitId,
      localDate,
    }: {
      habitId: string;
      localDate: string;
    }) => habitLogsService.resetLog(habitId, localDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}
