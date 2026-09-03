import { useState } from "react";
import { useSearchParams } from "react-router";
import { Code2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getLoginUrl } from "@/api/auth";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGitHubLogin = async () => {
    setIsRedirecting(true);
    const loginUrl = await getLoginUrl();
    window.location.href = loginUrl;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Code2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CodeMind</h1>
          <p className="text-sm text-muted-foreground">
            AI-Powered Code Intelligence & Repository RAG Workspace
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {error === "session"
                ? "Your session has expired or is invalid. Please sign in again."
                : "Failed to sign in with GitHub. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Connect your GitHub account to access your repositories and AI chat
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              size="lg"
              className="w-full font-semibold gap-2"
              onClick={handleGitHubLogin}
              disabled={isRedirecting}
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {isRedirecting ? "Connecting to GitHub…" : "Continue with GitHub"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Powered by Spring Boot RAG & React
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
