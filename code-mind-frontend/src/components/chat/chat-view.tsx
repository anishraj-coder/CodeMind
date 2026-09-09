import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowDown, FolderGit2, History, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ChatMessageItem } from "./components/chat-message-item";
import { ChatInput } from "./components/chat-input";
import { ChatSessionsSidebar, ChatSessionsContent } from "./components/chat-sessions-sidebar";
import { useSingleRepo } from "@/hooks/use-repo";
import { useChatSessions, useDeleteChatSession } from "@/hooks/use-chat-sessions";
import { useChatStream } from "@/hooks/use-chat-stream";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  repoId: string;
}

export function ChatView({ repoId }: ChatViewProps) {
  const numericRepoId = Number(repoId) || 0;
  const { data: repo, isLoading: isRepoLoading } = useSingleRepo(numericRepoId);
  const { data: sessions, isLoading: isSessionsLoading } = useChatSessions(numericRepoId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const {
    sessionId,
    messages,
    isGenerating,
    isLoadingHistory,
    sendMessage,
    startNewSession,
    selectSession,
    stopGenerating,
  } = useChatStream({
    repoId: numericRepoId,
    repoFullName: repo?.fullName || `repo-${repoId}`,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  // Check if user is scrolled near bottom
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom <= 100;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottom(!nearBottom && messages.length > 2);
  }, [messages.length]);

  const scrollToBottom = useCallback((smooth = false) => {
    if (!scrollContainerRef.current) return;
    if (smooth) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    isNearBottomRef.current = true;
    setShowScrollBottom(false);
  }, []);

  // When new messages or streaming tokens arrive: auto-scroll ONLY if user was already at bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, isGenerating, scrollToBottom]);

  // When switching sessions: reset scroll to bottom
  useEffect(() => {
    scrollToBottom(false);
  }, [sessionId, scrollToBottom]);

  const { mutate: deleteSession } = useDeleteChatSession(numericRepoId);

  const handleSelectSession = (id: string) => {
    selectSession(id);
    setMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    startNewSession();
    setMobileSidebarOpen(false);
  };

  const handleDeleteSession = (idToDelete: string) => {
    deleteSession(idToDelete);
    if (idToDelete === sessionId) {
      startNewSession();
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Left Sidebar */}
      <ChatSessionsSidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isLoading={isSessionsLoading}
      />

      {/* Main Chat Workspace */}
      <div className="flex flex-col flex-1 min-w-0 h-full min-h-0 relative">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b px-3 sm:px-4 py-2.5 bg-card/90 backdrop-blur shrink-0 z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 shrink-0")}
              title="Back to Repositories"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {/* Mobile Sidebar Sheet Trigger */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger
                className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-8 w-8 shrink-0 md:hidden cursor-pointer")}
                title="Previous chats"
              >
                <History className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 sm:max-w-xs flex flex-col h-full bg-sidebar text-sidebar-foreground border-sidebar-border">
                <SheetHeader className="p-4 border-b border-sidebar-border pb-3">
                  <SheetTitle className="text-sm font-semibold flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4 text-primary" />
                    {repo?.name || "Repository"} Chats
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Select a previous session or start a new one.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ChatSessionsContent
                    sessions={sessions}
                    activeSessionId={sessionId}
                    onSelectSession={handleSelectSession}
                    onNewChat={handleNewChat}
                    onDeleteSession={handleDeleteSession}
                    isLoading={isSessionsLoading}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold flex items-center gap-1.5 truncate">
                <FolderGit2 className="h-4 w-4 text-primary shrink-0 hidden sm:inline" />
                <span className="truncate">
                  {isRepoLoading ? "Loading..." : repo?.fullName || `Repo #${repoId}`}
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground truncate hidden xs:block">
                {repo?.language ? `${repo.language} • ` : ""}CodeMind AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {repo?.indexStatus === "READY" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-emerald-500 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">RAG </span>Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500 border border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {repo?.indexStatus || "Connecting"}
              </span>
            )}
          </div>
        </header>

        {/* Message Feed (Guaranteed Scrollable Container) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 md:p-6 space-y-4 overscroll-contain"
        >
          <div className="max-w-3xl mx-auto space-y-4 pb-2">
            {isLoadingHistory ? (
              <div className="space-y-4 py-12 max-w-xl mx-auto">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-12 w-3/4 bg-muted/60 rounded-xl animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-20 w-full bg-muted/60 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center space-y-4 px-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Ask anything about {repo?.name || "this codebase"}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    CodeMind retrieves relevant file chunks with exact line citations
                    and answers questions with codebase context.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-2 text-left">
                  <button
                    onClick={() => sendMessage("Give me an architectural overview of this project.")}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/60 text-xs transition-colors space-y-1 cursor-pointer"
                  >
                    <span className="font-medium text-foreground block">🏗️ Architecture Overview</span>
                    <span className="text-muted-foreground text-[11px] block">High level components & structure</span>
                  </button>
                  <button
                    onClick={() => sendMessage("How is authentication and security implemented?")}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/60 text-xs transition-colors space-y-1 cursor-pointer"
                  >
                    <span className="font-medium text-foreground block">🔐 Authentication Workflow</span>
                    <span className="text-muted-foreground text-[11px] block">Security filters, tokens & endpoints</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))
            )}
          </div>
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-24 right-6 h-9 w-9 rounded-full shadow-lg bg-background/90 backdrop-blur z-20 hover:bg-muted cursor-pointer"
            onClick={() => scrollToBottom(true)}
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-foreground" />
          </Button>
        )}

        {/* Pinned Bottom Input */}
        <ChatInput
          onSendMessage={sendMessage}
          onStopGenerating={stopGenerating}
          isGenerating={isGenerating || isLoadingHistory}
        />
      </div>
    </div>
  );
}
