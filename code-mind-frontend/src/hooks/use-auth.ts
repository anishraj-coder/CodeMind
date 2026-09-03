import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "@/api/auth";
import type { UserResponse } from "@/types/auth";

export const AUTH_QUERY_KEY = ["currentUser"];

export function useCurrentUser() {
  return useQuery<UserResponse | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
