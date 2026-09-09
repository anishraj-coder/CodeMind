import { AlertCircle, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IndexStatus } from "@/types/repo.ts";

interface RepoStatusBadgeProps {
  status: IndexStatus;
}

export function RepoStatusBadge({ status }: RepoStatusBadgeProps) {
  switch (status) {
    case "READY":
    case "DONE":
      return (
        <Badge variant="default" className="bg-emerald-600/15 text-emerald-500 hover:bg-emerald-600/20 border-emerald-500/30 gap-1 capitalize">
          <CheckCircle2 className="h-3 w-3" />
          Ready
        </Badge>
      );
    case "INDEXING":
      return (
        <Badge variant="secondary" className="bg-blue-500/15 text-blue-500 hover:bg-blue-500/20 border-blue-500/30 gap-1 capitalize">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Indexing
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1 capitalize">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "STALE":
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-500 gap-1 capitalize">
          <AlertTriangle className="h-3 w-3" />
          Stale
        </Badge>
      );
    case "PENDING":
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1 capitalize">
          <Clock className="h-3 w-3" />
          Not Indexed
        </Badge>
      );
  }
}
