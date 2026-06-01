import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notesService from '../api/notes-service';
import { dashboardKeys } from './use-dashboard';
import type { CreateNoteInput, UpdateNoteInput } from '../../types/api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (params?: Record<string, unknown>) => [...noteKeys.all, 'list', params] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
};

export function useNotes(params?: {
  cursor?: string;
  habitId?: string;
  limit?: number;
  localDate?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: noteKeys.list(params as Record<string, unknown>),
    queryFn: () => notesService.listNotes(params),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesService.getNote(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesService.createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      notesService.updateNote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
