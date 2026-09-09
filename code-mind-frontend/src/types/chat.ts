export interface CitationDto {
  filePath: string;
  startLine: number;
  endLine: number;
  language: string | null;
}

export type MessageRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  citations?: CitationDto[];
  createdAt?: string;
  isStreaming?: boolean;
}

export interface ChatMessageResponse {
  id?: string;
  role: MessageRole;
  content: string;
  citations?: CitationDto[];
  createdAt?: string;
}

export interface ChatSessionResponse {
  sessionId: string;
  sessionTitle: string;
  messages: number;
}

export interface ChatRequest {
  repoId: number;
  repositoryFullName: string;
  question: string;
}
