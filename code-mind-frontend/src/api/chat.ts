import { apiClient } from "@/api/client.ts";
import type { ChatSessionResponse, PaginatedChatHistory } from "@/types/chat.ts";

export const createChatSessionApi = async (repoId: number) => {
  const response = await apiClient.post<{ sessionId: string }>(
    `/api/chat/sessions/${repoId}/create`
  );
  return response.data;
};

export const fetchSessionsApi = async (repoId: number) => {
  const response = await apiClient.get<ChatSessionResponse[]>(
    `/api/chat/sessions/${repoId}`
  );
  return response.data;
};

export const fetchSessionHistoryApi = async (
  sessionId: string,
  limit = 15,
  before?: string
): Promise<PaginatedChatHistory> => {
  const response = await apiClient.get<PaginatedChatHistory>("/api/chat/sessions/history", {
    headers: {
      session_id: sessionId,
    },
    params: {
      limit,
      before: before || undefined,
    },
  });
  return response.data;
};


export const deleteChatSessionApi = async (sessionId: string) => {
  await apiClient.delete("/api/chat", {
    headers: {
      session_id: sessionId,
    },
  });
};
