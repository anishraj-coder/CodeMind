import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ExternalLink, FolderGit2, MessageSquare, Play, RefreshCw, RotateCcw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { RepoStatusBadge } from "@/components/dashboard/repo-status-badge.tsx";
import { fetchRepoStatus } from "@/api/repo.ts";
import { useDeleteRepoIndex } from "@/hooks/use-repo.ts";
import { cn } from "@/lib/utils";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";

interface RepoCardProps {
  repo: GitHubRepositoryResponse;
  onIndex: (repoId: number) => void;
  isIndexingAction?: boolean;
}

export function RepoCard({ repo, onIndex, isIndexingAction }: RepoCardProps) {
  const queryClient = useQueryClient();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { mutate: deleteIndex, isPending: isResettingIndex } = useDeleteRepoIndex();
  const isInitialIndexing = repo.indexStatus === "INDEXING" || isIndexingAction;

  // Poll individual repo status endpoint which returns actual filesProcessed & filesTotal
  const { data: statusData } = useQuery({
    queryKey: ["repo-status", repo.id],
    queryFn: () => fetchRepoStatus(repo.id),
    enabled: isInitialIndexing,
    refetchInterval: isInitialIndexing ? 1500 : false,
  });

  const currentStatus = statusData?.indexStatus || repo.indexStatus;
  const isReady = currentStatus === "READY" || currentStatus === "DONE";
  const isIndexing = currentStatus === "INDEXING" || isIndexingAction;

  const filesTotal = statusData?.filesTotal ?? repo.filesTotal ?? 0;
  const filesProcessed = statusData?.filesProcessed ?? repo.filesProcessed ?? 0;
  const chunkCount = statusData?.chunkCount ?? repo.chunkCount ?? 0;

  // If status becomes READY via polling, refresh the overall repos query
  useEffect(() => {
    if (statusData?.indexStatus === "READY" && repo.indexStatus === "INDEXING") {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    }
  }, [statusData?.indexStatus, repo.indexStatus, queryClient]);

  const progressPercent =
    filesTotal > 0
      ? Math.min(100, Math.round((filesProcessed / filesTotal) * 100))
      : 0;

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 truncate">
              <FolderGit2 className="h-5 w-5 text-muted-foreground shrink-0" />
              <a
                href={repo.htmlUrl || (repo.owner ? `https://github.com/${repo.owner}/${repo.name}` : `https://github.com/${repo.fullName}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-foreground truncate cursor-pointer"
                title="Open repository on GitHub"
              >
                {repo.name}
              </a>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {repo.description || "No description provided."}
            </CardDescription>
          </div>
          <RepoStatusBadge status={currentStatus} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {repo.language}
            </span>
          )}
          {isReady && chunkCount > 0 && (
            <span>{chunkCount} vector chunks</span>
          )}
        </div>

        {/* Live Indexing Progress Bar */}
        {isIndexing && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin text-primary shrink-0" />
                {filesTotal > 0
                  ? `Processing ${filesProcessed} / ${filesTotal} files`
                  : "Scanning & indexing repository..."}
              </span>
              <span>{filesTotal > 0 ? `${progressPercent}%` : "In progress"}</span>
            </div>
            <Progress
              value={filesTotal > 0 ? progressPercent : null}
              className={cn("h-1.5", filesTotal === 0 && "animate-pulse")}
            />
          </div>
        )}

        {/* Error message if indexing failed */}
        {currentStatus === "FAILED" && (statusData?.errorMessage || repo.errorMessage) && (
          <p className="text-xs text-destructive line-clamp-2">
            Error: {statusData?.errorMessage || repo.errorMessage}
          </p>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/20 px-6 py-3 flex justify-between items-center">
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {repo.owner}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={repo.htmlUrl || (repo.owner ? `https://github.com/${repo.owner}/${repo.name}` : `https://github.com/${repo.fullName}`)}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            title="Open in GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Reset Index action (available when ready/indexed) */}
          {isReady && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={isResettingIndex}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Reset index & clear chats"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", isResettingIndex && "animate-spin")} />
            </Button>
          )}

          {/* Conditional Action Buttons */}
          {isReady ? (
            <Link
              to={`/chat/${repo.id}`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Start Chat
            </Link>
          ) : isIndexing ? (
            <Button variant="secondary" size="sm" disabled className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Indexing...
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onIndex(repo.id)}
              className="gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              Index Repo
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Confirmation Dialog for Resetting Index */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Repository Index?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently purge all indexed vector embeddings and AI chat conversations for <strong>{repo.name}</strong>. The repository will return to unindexed state, and you can re-index it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={() => {
                deleteIndex(repo.id);
                setShowResetDialog(false);
              }}
            >
              Reset Index
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
