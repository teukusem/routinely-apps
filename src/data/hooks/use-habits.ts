import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as habitsService from '../api/habits-service';
import { dashboardKeys } from './use-dashboard';
import type { CreateHabitInput, UpdateHabitInput } from '../../types/api';

export const habitKeys = {
  all: ['habits'] as const,
  list: (lifecycle?: string, category?: string) =>
    [...habitKeys.all, 'list', lifecycle, category] as const,
  detail: (id: string) => [...habitKeys.all, 'detail', id] as const,
};

export function useHabits(lifecycle?: string, category?: string) {
  return useQuery({
    queryKey: habitKeys.list(lifecycle, category),
    queryFn: () => habitsService.listHabits(lifecycle, category),
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: habitKeys.detail(id),
    queryFn: () => habitsService.getHabit(id),
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitInput) => habitsService.createHabit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitsService.updateHabit(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsService.archiveHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRestoreHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsService.restoreHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
