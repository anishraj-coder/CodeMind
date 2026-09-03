import { useState } from "react";
import { ArrowLeft, Sparkles, FolderGit2 } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageItem } from "./components/chat-message-item";
import { ChatInput } from "./components/chat-input";
import { RepoSidebar } from "./components/repo-sidebar";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  repoId: string;
}

const defaultMessages: ChatMessage[] = [
  {
    id: "m1",
    sender: "assistant",
    content: "Hello! I've loaded the vector embeddings for repository. How can I help you explore or refactor this codebase today?",
    timestamp: "10:30 AM",
  },
];

export function ChatView({ repoId }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [isReplying, setIsReplying] = useState(false);

  const handleSendMessage = (userContent: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      content: userContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsReplying(true);

    // Simulate AI RAG response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "assistant",
        content: `Here is the architectural overview regarding your question on repository #${repoId}:\n\nThe authentication process is managed by Spring Security using OAuth2 and HTTP-only session cookies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        codeSnippets: [
          {
            filename: "AuthController.java",
            language: "java",
            code: `@GetMapping("/me")\npublic ResponseEntity<UserResponse> me() {\n    AppUserPrincipal userPrincipal = currentUser.require();\n    AppUser user = userPrincipal.getUser();\n    return ResponseEntity.ok(UserResponse.of(user));\n}`,
          },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsReplying(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Main Chat Workspace */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Chat Top Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-primary" /> Repository #{repoId}
              </h2>
              <p className="text-xs text-muted-foreground">CodeMind RAG Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              RAG Ready
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
            {isReplying && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg border bg-card animate-pulse">
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
                Searching code vector embeddings and generating answer...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isReplying} />
      </div>

      {/* Right Sidebar for Code Index Details */}
      <RepoSidebar repoId={repoId} />
    </div>
  );
}
