import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Send, Sparkles, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStopGenerating?: () => void;
  isGenerating?: boolean;
}

export function ChatInput({
  onSendMessage,
  onStopGenerating,
  isGenerating,
}: ChatInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim() || isGenerating) return;
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
    <div className="border-t bg-background/95 backdrop-blur-sm p-4 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="relative flex items-end rounded-xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
          <Textarea
            placeholder="Ask a question about this codebase (e.g., Explain the authentication workflow)..."
            className="min-h-[56px] max-h-[160px] w-full resize-none border-0 bg-transparent py-3.5 px-4 text-sm focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/70"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          <div className="flex items-center gap-2 p-2.5">
            {isGenerating ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={onStopGenerating}
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleSend}
                disabled={!content.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> RAG Context Retriever Active
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> to send, <kbd className="font-mono bg-muted px-1 rounded">Shift+Enter</kbd> for newline
          </span>
        </div>
      </div>
    </div>
  );
}
