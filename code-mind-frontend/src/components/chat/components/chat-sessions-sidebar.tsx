import { MessageSquare, Plus, MessagesSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatSessionResponse } from "@/types/chat.ts";
import { cn } from "@/lib/utils";

interface ChatSessionsContentProps {
  sessions?: ChatSessionResponse[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

export function ChatSessionsContent({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isLoading,
}: ChatSessionsContentProps) {
  return (
    <div className="flex flex-col h-full w-full bg-sidebar text-sidebar-foreground">
      {/* New Chat Button */}
      <div className="p-3 border-b border-sidebar-border shrink-0">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 bg-background/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border shadow-xs text-xs font-medium cursor-pointer transition-all"
          size="sm"
        >
          <Plus className="h-4 w-4 text-primary" /> New Conversation
        </Button>
      </div>

      {/* Sessions List Header */}
      <div className="p-3 pb-1 text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider shrink-0 flex items-center justify-between">
        <span>Previous Chats</span>
        {sessions && sessions.length > 0 && (
          <span className="text-[10px] lowercase font-normal">
            ({sessions.length})
          </span>
        )}
      </div>

      {/* Scrollable Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0 space-y-1">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="text-center py-8 px-2 text-xs text-muted-foreground">
            <MessagesSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            No previous conversations. Start a new chat!
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.sessionId === activeSessionId;
            return (
              <div
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between gap-2 group cursor-pointer border relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-sidebar-border shadow-xs"
                    : "border-transparent hover:bg-sidebar-accent/50 text-sidebar-foreground/75 hover:text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  <span className="truncate">{session.sessionTitle || "Chat session"}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={cn(
                      "text-[10px] shrink-0 font-mono px-1.5 py-0.5 rounded transition-opacity",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                        : "text-muted-foreground/80 bg-muted/60",
                      onDeleteSession && "group-hover:hidden"
                    )}
                  >
                    {session.messages}
                  </span>
                  {onDeleteSession && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.sessionId);
                      }}
                      title="Delete conversation"
                      className="hidden group-hover:flex items-center justify-center h-5 w-5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ChatSessionsSidebar(props: ChatSessionsContentProps) {
  return (
    <aside className="h-full border-r border-sidebar-border bg-sidebar w-64 shrink-0 hidden md:flex flex-col min-h-0">
      <ChatSessionsContent {...props} />
    </aside>
  );
}
