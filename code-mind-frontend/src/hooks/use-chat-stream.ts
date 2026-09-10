import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseSSEStream } from "@/lib/sse-parser.ts";
import { createChatSessionApi, fetchSessionHistoryApi } from "@/api/chat.ts";
import { API_BASE_URL } from "@/api/client.ts";
import type { ChatMessage, CitationDto } from "@/types/chat.ts";

interface UseChatStreamProps {
  repoId: number;
  repoFullName: string;
}

export function useChatStream({ repoId, repoFullName }: UseChatStreamProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const startNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setNextCursor(null);
    setHasMoreHistory(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const selectSession = async (existingSessionId: string) => {
    if (existingSessionId === sessionId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }

    setSessionId(existingSessionId);
    setMessages([]);
    setNextCursor(null);
    setHasMoreHistory(false);
    setIsLoadingHistory(true);

    try {
      const historyData = await fetchSessionHistoryApi(existingSessionId, 15);
      const rawMessages = historyData?.messages || [];
      // Backend returns Descending (newest first); reverse to Ascending (chronological top-to-bottom)
      const chronological = rawMessages.slice().reverse();

      const formattedMessages: ChatMessage[] = chronological.map((msg) => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        citations: msg.citations || [],
        createdAt: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : undefined,
      }));

      setMessages(formattedMessages);
      setNextCursor(historyData?.pagination?.nextKey || null);
      setHasMoreHistory(Boolean(historyData?.pagination?.hasMore));
    } catch (err) {
      console.error("Failed to load session history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadMoreHistory = async () => {
    if (!sessionId || !nextCursor || !hasMoreHistory || isLoadingMoreHistory || isGenerating) {
      return;
    }

    setIsLoadingMoreHistory(true);

    try {
      const historyData = await fetchSessionHistoryApi(sessionId, 15, nextCursor);
      const rawMessages = historyData?.messages || [];
      const chronological = rawMessages.slice().reverse();

      const formattedOlderMessages: ChatMessage[] = chronological.map((msg) => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        citations: msg.citations || [],
        createdAt: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : undefined,
      }));

      setMessages((prev) => [...formattedOlderMessages, ...prev]);
      setNextCursor(historyData?.pagination?.nextKey || null);
      setHasMoreHistory(Boolean(historyData?.pagination?.hasMore));
    } catch (err) {
      console.error("Failed to load more chat history:", err);
    } finally {
      setIsLoadingMoreHistory(false);
    }
  };


  const sendMessage = async (question: string) => {
    if (!question.trim() || isGenerating) return;

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const sessionRes = await createChatSessionApi(repoId);
        activeSessionId = sessionRes.sessionId;
        setSessionId(activeSessionId);
      } catch (err) {
        console.error("Failed to create chat session:", err);
        setIsGenerating(false);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "USER",
      content: question,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "ASSISTANT",
      content: "",
      citations: [],
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      const streamUrl = `${API_BASE_URL}/api/chat/sessions/stream`;
      const response = await fetch(streamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          session_id: activeSessionId,
        },
        credentials: "include",
        body: JSON.stringify({
          repoId,
          repositoryFullName: repoFullName,
          question,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat stream error: ${response.status}`);
      }

      await parseSSEStream(response, ({ event, data }) => {
        if (event === "citations") {
          try {
            const citations: CitationDto[] = JSON.parse(data);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, citations } : msg
              )
            );
          } catch (e) {
            console.error("Failed to parse citations JSON:", e);
          }
        } else if (event === "token") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: msg.content + data } : msg
            )
          );
        } else if (event === "done") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, isStreaming: false } : msg
            )
          );
          queryClient.invalidateQueries({ queryKey: ["chat-sessions", repoId] });
        }
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Streaming error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content:
                    msg.content + (msg.content ? "\n\n" : "") + "*(Failed to generate complete response. Please check your connection.)*",
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
      queryClient.invalidateQueries({ queryKey: ["chat-sessions", repoId] });
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  return {
    sessionId,
    messages,
    isGenerating,
    isLoadingHistory,
    isLoadingMoreHistory,
    hasMoreHistory,
    loadMoreHistory,
    sendMessage,
    startNewSession,
    selectSession,
    stopGenerating,
  };
}

