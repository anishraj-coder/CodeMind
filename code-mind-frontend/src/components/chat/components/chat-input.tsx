import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim() || isLoading) return;
    onSendMessage(content.trim());
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="relative flex items-center rounded-xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring">
        <Textarea
          placeholder="Ask a question about this repository codebase (e.g., How does authentication work?)..."
          className="min-h-[60px] max-h-[160px] w-full resize-none border-0 bg-transparent p-3 text-sm focus-visible:ring-0 shadow-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-2 pr-3">
          <Button
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> CodeMind RAG Engine Active
        </span>
        <span>Press Enter to send, Shift+Enter for newline</span>
      </div>
    </div>
  );
}
