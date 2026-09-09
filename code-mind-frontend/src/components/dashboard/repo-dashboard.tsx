import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useRepo, useSyncRepos } from "@/hooks/use-repo.ts";
import { useIndex } from "@/hooks/use-index.ts";
import { RepoCard } from "@/components/dashboard/repo-card.tsx";
import { RepoEmptyState } from "@/components/dashboard/repo-empty-state.tsx";
import { cn } from "@/lib/utils";

export function RepoDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, isError, data: repos } = useRepo();
  const { mutate: sync, isPending: isSyncing } = useSyncRepos();
  const { mutate: indexRepo, isPending: isIndexingPending } = useIndex();

  const filteredRepos = repos?.filter((repo) => {
    const query = searchQuery.toLowerCase();
    return (
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center text-destructive py-24">
        Error loading repositories. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Title and Sync Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repositories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your indexed repositories and start AI code chats.
          </p>
        </div>

        <Button onClick={() => sync()} disabled={isSyncing} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing..." : "Sync Repositories"}
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories by name or description..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Empty State */}
      {(!filteredRepos || filteredRepos.length === 0) && (
        <RepoEmptyState
          isSearch={Boolean(searchQuery)}
          isSyncing={isSyncing}
          onSync={() => sync()}
        />
      )}

      {/* Repositories Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRepos?.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            onIndex={(id) => indexRepo(id)}
            isIndexingAction={isIndexingPending}
          />
        ))}
      </div>
    </div>
  );
}