export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  codeSnippets?: {
    filename: string;
    code: string;
    language: string;
  }[];
}

export interface ChatSession {
  id: string;
  repoId: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}
