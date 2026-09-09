import { apiClient } from "@/api/client.ts";
import type { ChatMessageResponse, ChatSessionResponse } from "@/types/chat.ts";

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

export const fetchSessionHistoryApi = async (sessionId: string) => {
  const response = await apiClient.get<ChatMessageResponse[]>("/api/chat/sessions/history", {
    headers: {
      session_id: sessionId,
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
