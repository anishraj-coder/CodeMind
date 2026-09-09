import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an unhandled error]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackView
          title="Something went wrong"
          message={this.state.error?.message || "An unexpected error occurred in this view."}
          details={this.state.error?.stack || this.state.errorInfo?.componentStack}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackViewProps {
  title?: string;
  message?: string;
  details?: string | null;
  onReset?: () => void;
}

function ErrorFallbackView({
  title = "Something went wrong",
  message = "An unexpected error occurred in this view.",
  details,
  onReset,
}: ErrorFallbackViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (details) {
      navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-lg border-border/80 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-pretty">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {details && (
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
              </button>

              {showDetails && (
                <div className="relative rounded-lg bg-zinc-950 p-3 text-zinc-300 text-xs font-mono overflow-x-auto max-h-48 border border-zinc-800">
                  <pre className="leading-relaxed whitespace-pre-wrap select-text">{details}</pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 h-6 w-6 text-zinc-400 hover:text-zinc-100"
                    title="Copy error trace"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border/60">
          {onReset && (
            <Button onClick={onReset} variant="default" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Page
          </Button>
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export function RouteErrorFallback() {
  const error = useRouteError();

  let title = "Page Error";
  let message = "An error occurred while rendering this route.";
  let details: string | null = null;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || (error.status === 404 ? "The requested page does not exist." : "Failed to load route.");
  } else if (error instanceof Error) {
    message = error.message;
    details = error.stack || null;
  }

  return (
    <ErrorFallbackView
      title={title}
      message={message}
      details={details}
      onReset={() => {
        window.location.href = "/dashboard";
      }}
    />
  );
}
