import { Bot, User, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatCitations } from "./chat-citations";
import { ChatCodeBlock } from "./chat-code-block";
import type { ChatMessage } from "@/types/chat.ts";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "USER";

  return (
    <div
      className={`flex gap-3.5 p-4 rounded-xl border transition-colors ${
        isUser ? "bg-muted/40 border-border/50" : "bg-card border-border shadow-xs"
      }`}
    >
      <Avatar
        className={`h-8 w-8 shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-emerald-600/90 text-white dark:bg-emerald-600"
        }`}
      >
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            {isUser ? "You" : "CodeMind Assistant"}
            {!isUser && message.isStreaming && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-normal">
                <Sparkles className="h-3 w-3 animate-spin" /> Thinking...
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {message.createdAt && (
              <span className="text-[11px] text-muted-foreground">
                {message.createdAt}
              </span>
            )}
            {!isUser && message.content && !message.isStreaming && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleCopy}
                title="Copy response"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Citations / Sources Pills */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <ChatCitations citations={message.citations} />
        )}

        {/* Message Content */}
        {isUser ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans text-foreground">
            {message.content}
          </div>
        ) : (
          <div className="text-sm leading-relaxed break-words font-sans text-foreground">
            {message.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-([a-zA-Z0-9_+-]+)/.exec(className || "");
                    const isInline = !match && !String(children).includes("\n");
                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-xs border border-border/50"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <ChatCodeBlock
                        language={match ? match[1] : "text"}
                        code={String(children).replace(/\n$/, "")}
                      />
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-lg border border-border">
                        <table className="w-full border-collapse text-xs text-left">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-muted/60 border-b border-border">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="p-2.5 font-semibold text-foreground">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="p-2.5 border-t border-border/50">{children}</td>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside space-y-1 my-2 pl-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside space-y-1 my-2 pl-1">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="leading-relaxed">{children}</li>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic">
                        {children}
                      </blockquote>
                    );
                  },
                  p({ children }) {
                    return <p className="leading-relaxed mb-2 last:mb-0">{children}</p>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : message.isStreaming && !message.citations?.length ? (
              <span className="inline-block animate-pulse text-muted-foreground">
                Synthesizing response...
              </span>
            ) : null}
            {message.isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
