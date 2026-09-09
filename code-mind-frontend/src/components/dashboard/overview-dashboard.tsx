import { Link } from "react-router";
import { FolderGit2, MessageSquare, HardDrive, ArrowUpRight, Plus, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RepoStatusBadge } from "@/components/dashboard/repo-status-badge";
import { useRepo, useSyncRepos } from "@/hooks/use-repo.ts";
import { cn } from "@/lib/utils";

export function OverviewDashboard() {
  const { data: repos, isLoading } = useRepo();
  const { mutate: sync, isPending: isSyncing } = useSyncRepos();

  const totalRepos = repos?.length || 0;
  const indexedRepos = repos?.filter((r) => r.indexStatus === "READY" || r.indexStatus === "DONE") || [];
  const indexingRepos = repos?.filter((r) => r.indexStatus === "INDEXING") || [];
  const totalChunks = repos?.reduce((acc, r) => acc + (r.chunkCount || 0), 0) || 0;
  const totalFiles = repos?.reduce((acc, r) => acc + (r.filesProcessed || 0), 0) || 0;

  const stats = [
    {
      title: "Indexed Repositories",
      value: `${indexedRepos.length}`,
      total: `${totalRepos} repos total`,
      icon: FolderGit2,
    },
    {
      title: "Vector Code Chunks",
      value: totalChunks.toLocaleString(),
      total: `${totalFiles} files embedded`,
      icon: MessageSquare,
    },
    {
      title: "Active Indexing",
      value: indexingRepos.length > 0 ? `${indexingRepos.length} in progress` : "Idle",
      total: indexingRepos.length > 0 ? "Generating chunks" : "All queues cleared",
      icon: HardDrive,
    },
  ];

  const recentRepos = repos?.slice(0, 5) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Welcome to CodeMind <Sparkles className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore your codebase, ask architectural questions, and chat with your repositories in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => sync()}
            disabled={isSyncing}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync Repositories"}
          </Button>
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
            <Plus className="mr-2 h-4 w-4" /> Manage Repos
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.total}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Repositories Section */}
      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Repositories</CardTitle>
            <CardDescription>Quick access to your active codebases</CardDescription>
          </div>
          <Link to="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : recentRepos.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground space-y-3">
              <FolderGit2 className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p>No repositories found. Sync your GitHub account to get started.</p>
              <Button onClick={() => sync()} disabled={isSyncing} variant="outline" size="sm">
                Sync Repositories
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRepos.map((repo) => {
                const isReady = repo.indexStatus === "READY" || repo.indexStatus === "DONE";
                return (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2 truncate">
                        <FolderGit2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={repo.htmlUrl || (repo.owner ? `https://github.com/${repo.owner}/${repo.name}` : `https://github.com/${repo.fullName}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sm hover:underline text-foreground truncate cursor-pointer"
                          title="Open in GitHub"
                        >
                          {repo.name}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        {repo.language && (
                          <>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              {repo.language}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{repo.chunkCount || 0} chunks</span>
                        {repo.indexedAt && (
                          <>
                            <span>•</span>
                            <span>Indexed {new Date(repo.indexedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <RepoStatusBadge status={repo.indexStatus} />
                      {isReady ? (
                        <Link
                          to={`/chat/${repo.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1 text-xs")}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          Chat
                        </Link>
                      ) : (
                        <Link
                          to="/dashboard"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs text-muted-foreground")}
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
