import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/chat";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isUser = message.sender === "user";

  return (
    <div className={`flex gap-4 p-4 ${isUser ? "bg-muted/30" : "bg-card"} rounded-xl border`}>
      <Avatar className={`h-8 w-8 ${isUser ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"}`}>
        <AvatarFallback>{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            {isUser ? "You" : "CodeMind AI"}
          </span>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>

        <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {message.content}
        </div>

        {message.codeSnippets && message.codeSnippets.length > 0 && (
          <div className="space-y-3 pt-2">
            {message.codeSnippets.map((snippet, idx) => (
              <div key={idx} className="rounded-lg border bg-zinc-950 text-zinc-100 overflow-hidden text-xs">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
                  <span className="font-mono text-zinc-400">{snippet.filename}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    onClick={() => handleCopyCode(snippet.code, idx)}
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-zinc-200 leading-relaxed">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
