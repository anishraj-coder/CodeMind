import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
  message?: string;
}

export function PageLoader({ className, message = "Loading CodeMind..." }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[50vh] w-full flex-1 items-center justify-center bg-background/50 backdrop-blur-xs",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute h-4 w-4 rounded-full bg-primary/20 animate-ping" />
        </div>
        <span className="text-xs font-medium tracking-wide text-muted-foreground animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
}
