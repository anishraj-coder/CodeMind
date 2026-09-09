import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSessionsApi, deleteChatSessionApi } from "@/api/chat.ts";
import type { ChatSessionResponse } from "@/types/chat.ts";

export const useChatSessions = (repoId: number) => {
  return useQuery<ChatSessionResponse[]>({
    queryKey: ["chat-sessions", repoId],
    queryFn: () => fetchSessionsApi(repoId),
    enabled: Boolean(repoId) && repoId > 0,
  });
};

export const useDeleteChatSession = (repoId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteChatSessionApi(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", repoId] });
    },
  });
};
