import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useCurrentUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { data: user, isLoading, isFetched } = useCurrentUser();
  const location = useLocation();

  if (isLoading || !isFetched) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Authenticating session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?error=session" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
