import { FolderGit2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RepoEmptyStateProps {
  isSearch: boolean;
  isSyncing: boolean;
  onSync: () => void;
}

export function RepoEmptyState({ isSearch, isSyncing, onSync }: RepoEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
      <FolderGit2 className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <h3 className="text-lg font-semibold">
        {isSearch ? "No matching repositories" : "No repositories found"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {isSearch
          ? "Try adjusting your search query to find the repository you are looking for."
          : "Click sync to pull your repositories directly from GitHub."}
      </p>
      {!isSearch && (
        <Button onClick={onSync} disabled={isSyncing} variant="outline" className="gap-2">
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </div>
  );
}
