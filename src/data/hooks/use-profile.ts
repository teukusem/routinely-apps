import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userService from '../api/user-service';
import type { UpdateProfileInput, UpdateEmailInput, UpdatePasswordInput } from '../../types/api';

export const profileKeys = {
  all: ['profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: () => userService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userService.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEmailInput) => userService.updateEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (input: UpdatePasswordInput) => userService.updatePassword(input),
  });
}

export function useRequestDeletion() {
  return useMutation({
    mutationFn: (currentPassword: string) =>
      userService.requestDeletion(currentPassword),
  });
}
