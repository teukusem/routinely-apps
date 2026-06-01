import { apiClient } from './api-client';
import type { ApiNote, CreateNoteInput, UpdateNoteInput } from '../../types/api';

// ─── Notes API ─────────────────────────────────────────────────────────────────
export async function createNote(input: CreateNoteInput): Promise<ApiNote> {
  const response = await apiClient.post('/notes', input);
  return response.data.data;
}

export async function listNotes(params?: {
  cursor?: string;
  habitId?: string;
  limit?: number;
  localDate?: string;
  q?: string;
}): Promise<{ data: ApiNote[]; meta: { nextCursor: string | null } }> {
  const response = await apiClient.get('/notes', { params });
  return response.data;
}

export async function getNote(id: string): Promise<ApiNote> {
  const response = await apiClient.get(`/notes/${id}`);
  return response.data.data;
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<ApiNote> {
  const response = await apiClient.patch(`/notes/${id}`, input);
  return response.data.data;
}

export async function deleteNote(id: string): Promise<void> {
  await apiClient.delete(`/notes/${id}`);
}
