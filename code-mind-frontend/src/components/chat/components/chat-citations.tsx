import { FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CitationDto } from "@/types/chat.ts";

interface ChatCitationsProps {
  citations?: CitationDto[];
}

export function ChatCitations({ citations }: ChatCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-1.5 pt-2">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
        Retrieved Code Context
      </span>
      <div className="flex flex-wrap gap-1.5">
        {citations.map((cite, index) => {
          const fileName = cite.filePath.split("/").pop() || cite.filePath;
          const lineRange =
            cite.startLine > 0 && cite.endLine > 0
              ? ` (L${cite.startLine}–${cite.endLine})`
              : "";

          return (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs font-mono gap-1 py-1 px-2.5 bg-muted/60 hover:bg-muted border border-border/40 transition-colors"
              title={cite.filePath}
            >
              <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[200px]">{fileName}</span>
              {lineRange && (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {lineRange}
                </span>
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
